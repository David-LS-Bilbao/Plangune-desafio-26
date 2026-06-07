# Cierre feature auth/roles minimo

Rama: `feat/predev-auth-roles-minimum`

Fecha de cierre tecnico: 2026-06-07

## Objetivo

Cerrar la feature de login real minimo con roles/guards antes del PR a `dev`, sustituyendo el
login mock por autenticacion real y dejando el sistema defendible para una futura exposicion en
VPS.

## Alcance implementado

- Backend Express:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Passwords con `bcryptjs` y respuestas sin hash/password.
- JWT en cookie `httpOnly`, con soporte adicional de `Authorization: Bearer` para tests e
  integraciones.
- `requireAuth` y `requireRole`.
- Registro publico limitado a `family` y `business`; `admin` solo por seed/DB.
- Favoritos protegidos con `requireAuth + requireRole('family')`.
- Frontend con `useAuthStore`, `checkSession`, `ProtectedRoute`, rutas por rol y redirecciones:
  - `family -> /buscar`
  - `business -> /negocio`
  - `admin -> /admin`

## Hardening aplicado antes de cierre

- CORS cerrado:
  - en produccion exige `CLIENT_URL`;
  - en dev/test permite `http://localhost:5173` por defecto;
  - no usa fallback abierto con credenciales.
- Rate limit basico en `/api/auth/login` y `/api/auth/register`.
- `JWT_SECRET` debe existir, tener 32+ caracteres y no ser un placeholder conocido.
- JWT firma/verifica con algoritmo explicito `HS256`.
- Seed bloqueado si `NODE_ENV=production`.
- Login usa hash dummy cuando el email no existe para reducir diferencia de timing.
- Password backend: minimo 8, maximo 72 caracteres por limite practico de bcrypt.
- Comentarios obsoletos de favoritos actualizados.
- Stub de `window.scrollTo` en tests frontend para limpiar ruido de jsdom.

## Regla de acceso de producto

Usuario no registrado puede acceder solo a:

- `/`
- `/login`
- `/register`
- `/crear-familia`
- `/crear-negocio`
- `/ofertas`
- `/negocio/ofertas`

Usuario no registrado no puede acceder a:

- `/planes`
- `/planes/:id`
- `/buscar`
- `/favoritos`
- `/perfil`
- `/negocio` salvo `/negocio/ofertas`
- `/admin`
- `/admin/data`
- `/dev/family-chat`

Roles:

- `family`: flujo familiar.
- `business`: panel de negocio.
- `admin`: admin y panel negocio.
- Rol insuficiente: `/no-autorizado`.

## Validacion ejecutada

- `git diff --check`: OK.
- `npm run test:backend`: 16 suites, 158 tests OK.
- `npm run test:frontend`: 10 suites, 51 tests OK.
- `npm run build --workspace frontend`: OK.
- Docker backend reconstruido y recreado: OK.
- Runtime:
  - `/api/health`: OK.
  - CORS con `Origin: http://localhost:5173`: OK.
  - token `business` contra `/api/favorites`: `403`.

## Notas operativas

- `backend/.env` local necesita un `JWT_SECRET` largo de desarrollo; el archivo no se commitea.
- Para probar usuarios demo (`familia@demo.com`, `negocio@demo.com`, `admin@demo.com`) hay que
  ejecutar seed en la DB local si no existen.
- Los endpoints de catalogo/recomendaciones/asistente siguen publicos a nivel backend en esta fase;
  el control de navegacion se aplica en frontend. Si producto decide hacerlos solo-miembros, se
  protegeran en una tarea posterior.

## Documentacion relacionada

- [Login real minimo + roles y guards](../features/auth-roles-minimum.md)
- [Flujo de agentes](../ai/AGENT_WORKFLOW.md)
