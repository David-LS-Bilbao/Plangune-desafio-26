# Login real mínimo + roles y guards

Rama: `feat/predev-auth-roles-minimum` · Base: `test/integration-frontend-backend-20260605`

Login real con JWT y control de acceso por rol (`family`, `business`, `admin`), sustituyendo el
login mock anterior. Cubre registro público, inicio de sesión, sesión persistente y guards de
navegación + protección de los endpoints sensibles.

## Decisiones de diseño

| Tema | Decisión | Motivo |
|------|----------|--------|
| Registro | **Público** para `family`/`business`; `admin` solo por seed/DB | Evita auto-registro de administradores. |
| Transporte del token | **Cookie httpOnly** `token` (no `localStorage`) | No accesible por JS → mitiga XSS (dato sensible: familias con menores). |
| Enforcement | **Guards en frontend** + **JWT en endpoints por usuario/rol** (favoritos) | El resto del catálogo (events/recommendations/assistant) se protege a nivel de navegación. |
| Hash | `bcryptjs` (10 rounds), ya en dependencias | Pure-JS, sin build nativo (Windows-friendly). |
| `admin` → negocio | El admin **puede** entrar en el área de negocio | `ProtectedRoute allow={['business','admin']}`. El admin **no** entra en el flujo de familia. |

## Backend

Endpoints (`/api/auth`):

| Método | Ruta | Auth | Respuesta |
|--------|------|------|-----------|
| POST | `/register` | pública | 201 `{ user }` + cookie `token` (auto-login). 409 si email duplicado, 422 si datos/rol inválidos. |
| POST | `/login` | pública | 200 `{ user }` + cookie. 401 genérico (no revela si el email existe). |
| GET | `/me` | requiere cookie/Bearer | 200 `{ user }`. 401 si no hay sesión. |
| POST | `/logout` | pública | 200 `{ ok }` + borra la cookie. |

- `user` = `{ id, email, role }`. **Nunca** se devuelve el hash de contraseña.
- Middlewares: `requireAuth` (lee el token de la cookie httpOnly o de `Authorization: Bearer`) y
  `requireRole(...roles)`.
- **Favoritos** (`/api/favorites`) ahora requieren `requireAuth` + `requireRole('family')`: el
  `userId` proviene del token (se eliminó `MOCK_FAMILY_USER_ID`).
- CORS: `credentials: true` (necesario para la cookie) y lista cerrada. `CLIENT_URL` debe coincidir
  con el origen del frontend; en producción se rechaza arrancar sin `CLIENT_URL`.
- `/login` y `/register` tienen rate limit básico para frenar fuerza bruta online.

Archivos: `utils/jwt.js`, `repositories/user.repository.js`, `services/auth.service.js`,
`controllers/auth.controller.js`, `middlewares/auth.middleware.js`, `routes/auth.routes.js`.

### Variables de entorno (`backend/.env`)

```
JWT_SECRET=<valor largo y aleatorio de 32+ caracteres>   # NO commitear; placeholders se rechazan
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Frontend

- `services/authApi.js`: `login`, `register`, `fetchMe`, `logout`. `apiClient` usa
  `withCredentials: true` (envía/recibe la cookie).
- `store` (`useAuthStore`): `user`, `status` (`loading` | `authenticated` | `guest`), `login`,
  `register`, `logout`, `checkSession`, `updateUser`. El token **no** se guarda en JS; el `user`
  se cachea en `localStorage` solo para evitar parpadeos de UI.
- `App.jsx` llama a `checkSession()` una vez al arrancar (valida la cookie vía `/me`).
- `components/auth/ProtectedRoute.jsx`: guard por login + rol. `loading` → spinner; sin sesión →
  `/login`; rol insuficiente → `/no-autorizado`.
- UX: mensajes de error amables, estado de carga en botones, "Cerrar sesión" en la navbar.

### Rutas públicas vs protegidas

| Acceso | Rutas |
|--------|-------|
| **Pública** (sin login) | `/`, `/login`, `/register`, `/no-autorizado`, `/crear-familia`, `/crear-negocio`, `/ofertas`, `/negocio/ofertas` |
| **family** | `/planes`, `/planes/:id`, `/favoritos`, `/perfil`, `/buscar` (+ GUNI dev) |
| **business** o **admin** | `/negocio` y subrutas (excepto `/negocio/ofertas`, que es pública) |
| **admin** | `/admin`, `/admin/data` |

Tras el login se redirige por rol: `family → /buscar`, `business → /negocio`, `admin → /admin`.

> **Nota (P2):** `/negocio/ofertas` se mantiene **pública** por requisito del brief. Hoy es una
> pantalla demo (datos en store mock, sin persistencia). Cuando gestione datos reales debe pasar a
> requerir rol `business`.

## Usuarios demo (solo desarrollo)

El seed (`backend/prisma/seed.js`) crea 3 cuentas con login real (hash bcrypt):

| Email | Rol | Contraseña |
|-------|-----|------------|
| `familia@demo.com` | family | `Demo1234!` |
| `negocio@demo.com` | business | `Demo1234!` |
| `admin@demo.com` | admin | `Demo1234!` |

Sembrar: `npm run db:seed --workspace backend` (requiere DB levantada + `prisma generate`).
El seed se bloquea con `NODE_ENV=production` para evitar credenciales demo en entornos reales.

## Tests

- Backend (`backend/src/tests/auth.test.js`): register OK, email duplicado (409), rol admin
  rechazado (422), password corta (422), login OK, password incorrecta (401), email inexistente
  (401), `/me` sin token (401), `/me` con token (200 sin password), `/me` vía cookie, logout,
  secreto JWT débil rechazado, y `requireAuth`/`requireRole` (401/403/200). `favorites.test.js`
  actualizado: 401 sin token y 403 para rol no family. `authRateLimit.test.js` cubre 429.
- Frontend (`frontend/src/tests/auth.test.jsx`): login renderiza, submit guarda sesión y
  redirige, error amable (401), `/buscar` sin sesión → `/login`, `/negocio/ofertas` pública
  accesible, business entra en `/negocio`, family no entra en `/admin`.

## Limitaciones conocidas (futuro)

- Los datos de onboarding (nombre de familia, miembros, datos del negocio) **no** se persisten aún:
  el registro solo crea la cuenta de usuario. Falta crear las entidades `Family`/`Business`.
- Sin recuperación de contraseña, sin OAuth, sin refresh token (fuera de alcance del MVP).
- `updateUser` (avatar/preferencias) es solo cliente; no hay endpoint de perfil todavía.
