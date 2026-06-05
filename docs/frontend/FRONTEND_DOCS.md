# Documentación Frontend — DESAFIO-26
> Última actualización: 2026-06-04

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool / dev server |
| React Router DOM 6 | Enrutado SPA |
| Zustand | Gestión de estado global |
| Material Symbols (Google CDN) | Iconografía |
| Vanilla CSS (con nesting nativo) | Estilos (sin Tailwind) |
| Google Fonts: Inter + Montserrat | Tipografía |

**Dev server:** `npm run dev:frontend` → `http://localhost:5173`

---

## Estructura de carpetas

```
frontend/src/
├── App.jsx               # Punto de entrada React (monta AppRoutes)
├── main.jsx              # Entry de Vite: monta App en #root con BrowserRouter
│
├── assets/               # hero-image.webp, logo-temp.svg
├── components/
│   ├── auth/
│   │   └── LoginForm.jsx         # Formulario login con detección automática de rol
│   ├── common/
│   │   ├── Header.jsx            # Header móvil con drawer lateral filtrado por rol
│   │   ├── Navbar.jsx            # Navbar de Landing (sin autenticación)
│   │   └── PlanCard.jsx          # Tarjeta reutilizable de plan familiar
│   └── layout/
│       ├── MainLayout.jsx        # Layout familias: Header + Outlet + Navigation
│       ├── BusinessLayout.jsx    # Layout negocios: header propio + Outlet + Navigation
│       ├── AdminLayout.jsx       # Layout administración
│       └── Navigation.jsx        # Barra de navegación inferior filtrada por rol
│
├── mocks/
│   └── data.js           # mockPlans (5 planes) + MOCK_USERS (3 roles)
│
├── pages/                # 22 páginas
├── routes/
│   └── AppRoutes.jsx     # Todas las rutas agrupadas por layout/rol
├── store/
│   └── index.js          # 5 stores Zustand
└── styles/
    ├── index.css         # Hoja principal (~5.500 líneas)
    └── landing.css       # Estilos específicos de Landing
```

---

## Sistema de rutas

Definido en `AppRoutes.jsx`. Rutas agrupadas en tres layouts según tipo de usuario.

### Rutas públicas (sin layout)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Landing` | Presentación del producto |
| `/login` | `Login` | Formulario de autenticación |
| `/crear-familia` | `CreateFamily` | Registro de cuenta familiar |
| `/crear-negocio` | `CreateBusiness` | Registro de cuenta de negocio |

### Área Familias — `MainLayout`

| Ruta | Componente | Descripción |
|---|---|---|
| `/planes` | `PlansList` | Listado con categorías y ordenación por suscripción |
| `/planes/:id` | `PlanDetail` | Detalle de un plan |
| `/favoritos` | `Favorites` | Planes guardados |
| `/perfil` | `FamilyProfile` | Perfil familiar: hijos, preferencias, avatar |
| `/ofertas` | `OffersUser` | Descuentos disponibles para familias |
| `/buscar` | `PlansSearch` | Buscador avanzado con filtros |

### Área Negocios — `BusinessLayout`

| Ruta | Componente | Descripción |
|---|---|---|
| `/negocio` | `BusinessDashboard` | Crear actividad + stats rápidas |
| `/negocio/dashboard` | `BusinessOverview` | Panel resumen con KPIs y acciones rápidas |
| `/negocio/perfil` | `BusinessProfile` | Perfil del negocio |
| `/negocio/rendimiento` | `BusinessPerformance` | Estadísticas y reseñas |
| `/negocio/estrategia` | `BusinessStrategy` | Herramientas de visibilidad |
| `/negocio/suscripciones` | `BusinessSubscriptions` | Gestión del plan de pago |
| `/negocio/crear-oferta` | `CreateOffer` | Formulario para crear oferta |
| `/negocio/ofertas` | `ManageOffers` | Listado y gestión de ofertas |

### Área Admin — `AdminLayout`

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin` | `AdminDashboard` | Panel de aprobación de negocios + stats globales |
| `/admin/data` | `AdminData` | Tablas de datos de usuarios y negocios |

---

## Componentes

### `Header.jsx`
Header fijo superior del área de familias (`MainLayout`).

**Funcionalidades:**
- Botón hamburguesa abre un **drawer lateral deslizante**.
- El drawer filtra los ítems de navegación **según `user.role`**:
  - Sin sesión → Inicio, Explorar planes, Iniciar sesión
  - `family` → Inicio, Explorar, Favoritos, Mi perfil, Ofertas
  - `business` → Dashboard, Mis ofertas, Rendimiento, Estrategia, Suscripción
  - `admin` → Panel admin, Datos
- Si hay sesión, muestra **bloque de usuario** (avatar, nombre, rol) en la cabecera del drawer.
- El icono de cuenta en el header navega al destino correcto según el rol.
- Botón de **cerrar sesión** en rojo al fondo del drawer.
- Overlay semitransparente cierra el drawer al hacer clic fuera.

### `Navigation.jsx`
Barra de navegación inferior fija (estilo app móvil).

**Funcionalidades:**
- Filtra sus enlaces según `user.role` del Auth store:
  - `admin` → Panel, Datos
  - `business` → Inicio, Ofertas, Actividad
  - Por defecto/`family` → Inicio, Planes, Ofertas, Buscar, Perfil
- **No se muestra** en: `/`, `/login`, `/crear-familia`, `/crear-negocio`.
- El icono de la ruta activa se rellena (`font-variation-settings: FILL 1`).

### `LoginForm.jsx`
Formulario de inicio de sesión.

**Funcionalidades:**
- **Toggle show/hide contraseña** con botón de ojo a la derecha del campo (icono `visibility` / `visibility_off`).
- Detección automática de rol al hacer login:
  1. Compara el email contra `MOCK_USERS`.
  2. Si no coincide: infiere por palabras clave (`admin`, `negocio`, `business`, `info`).
  3. Por defecto: rol `family`.
- Redirige automáticamente según el rol detectado.

### `PlanCard.jsx`
Tarjeta reutilizable de plan familiar. Usada en `PlansList`, `Favorites` y `PlansSearch`.

---

## Páginas — funcionalidad detallada

### Landing (`/`)
Secciones: Hero con imagen de fondo → "El problema" → "Cómo funciona" (3 pasos) → Beneficios (6 cards) → "Para negocios" → CTA final.
CTA principal → `/planes`; CTA negocio → `/negocio`.

### PlansList (`/planes`)
- Filtros de **categoría**: Todos, Museos, Parques, Talleres, Naturaleza, Restaurantes.
- **Ordenación automática** por tier de suscripción: Premium > Pro > Base > None.
- Acceso al buscador avanzado.

### PlansSearch (`/buscar`)
Buscador avanzado con tres tipos de filtros simultáneos:
1. **Texto libre** → filtra por `title` y `location`.
2. **Edad** (Bebé / 1-3 años / 4-6 años) → chips interactivos con estilo activo/inactivo, conectados a `ageFilters` del store.
3. **Servicios** (Carrito, Cambiador, Interior, Tranquilo, Gratis) → checkboxes conectados a `activeFilters`.

Además:
- Resumen visual de **filtros activos** como chips de color.
- Contador de resultados dinámico: "N planes encontrados".

### PlanDetail (`/planes/:id`)
- Grid de info práctica (edad, precio, categoría, carrito, recomendado).
- **Botón Reservar**: al confirmar cambia a "¡Reservado!" con icono `check_circle`, queda deshabilitado, y registra la reserva en `useUserStore.addReservation()`.
- **Botón "Cómo llegar"**: abre Google Maps con la ubicación del plan.
- **Botón Favorito**: alterna con `toggleFavorite()` y cambia estilo visualmente.
- **Sección de reseñas**: formulario expandible con valoración por estrellas (1-5) y texto libre. Añade la reseña al estado local y colapsa el formulario.
- **Reportar incidencia**: botón que muestra mensaje de estado inline sin alert().

### FamilyProfile (`/perfil`)
- Avatar editable con iniciales (máx. 2 chars), guarda en Auth store.
- **Gestión de hijos**: listado con botón eliminar + formulario inline (género + edad) para añadir.
- **5 preferencias tipo toggle**: carrito, cambiador, interior, presupuesto, tranquilos.
- "Guardar perfil" → feedback de 2 segundos inline.

### Favorites (`/favoritos`)
- Muestra planes cuyo `id` está en `useUserStore().favorites`.
- Estado vacío con mensaje descriptivo.

### BusinessOverview (`/negocio/dashboard`)
- **Bento grid de 6 acciones rápidas**: Crear actividad, Crear oferta, Mi estrategia, Suscripciones, Editar perfil, Ver reseñas.
- **6 KPIs**: actividades activas (conectado a `offers.length`), ofertas activas, pendientes, reseñas (+2 esta semana), vistas (1.2k últimos 30d), clics ofertas.

### BusinessDashboard (`/negocio`)
Formulario de nueva actividad:
- Nombre (requerido), categoría (select).
- **Campo Servicios funcional**: input controlado + botón `+` o tecla `Enter` → añade chip. Botón `×` en chip → elimina. Previene duplicados y valores vacíos.
- Al enviar: llama `addOffer()`, muestra confirmación, resetea el formulario (incluidos chips).
- Stats rápidas: actividades activas, pendientes, reseñas.

### ManageOffers (`/negocio/ofertas`)
- Tabs de filtrado: Todas / Activas / Pendientes (con contadores dinámicos).
- Por cada oferta:
  - **Editar**: `window.prompt()` pre-relleno → llama a `updateOffer()`.
  - **Pausar / Activar**: alterna status `active` ↔ `paused`; deshabilitado si `pending`.
  - **Borrar**: `window.confirm()` + `deleteOffer()`.

### BusinessSubscriptions (`/negocio/suscripciones`)
- 3 planes: Base (€29/mes), Pro (€59/mes), Premium (€99/mes).
- Tarjeta del plan activo: badge "Plan actual" + borde de color primario + botón deshabilitado.
- Al cambiar plan: **toast flotante animado** con auto-dismiss a los 3.5 segundos.
- Sincronizado con `businessStore.subscription`.

### BusinessStrategy (`/negocio/estrategia`)
- 4 herramientas de visibilidad: Destacados, Mailing, Destacados en mapa, Filtro patrocinado.
- Muestra alerta de upgrade si el negocio no tiene suscripción suficiente.

### AdminDashboard (`/admin`)
- Lista de negocios pendientes de aprobación con botones Aprobar / Rechazar.
- Stats globales de la plataforma.

### AdminData (`/admin/data`)
- Tablas de datos de usuarios, negocios y métricas de la plataforma.

---

## Gestión de estado — Zustand

Cinco stores en `store/index.js`:

### `useAuthStore`
```js
user: null | UserObject    // Usuario autenticado
login(payload)             // String de rol ('family') u objeto completo
updateUser(partial)        // Actualiza campos del usuario activo
logout()                   // Pone user a null
```

### `useUserStore`
```js
favorites: number[]        // IDs de planes favoritos
reservations: []           // Planes reservados con timestamp
children: []               // Hijos: { id, name/type, age }
toggleFavorite(planId)     // Añade o quita de favoritos
isFavorite(planId)         // → boolean
addReservation(plan)       // Añade reserva con fecha ISO
addChild(child)            // Añade hijo con id generado
removeChild(id)            // Elimina hijo por id
```

### `useBusinessStore`
```js
offers: []                 // Ofertas: status active | pending | paused
subscription: 'Free'       // Free | Base | Pro | Premium
stats: { views, clicks, reservations }
addOffer(offer)
updateOffer(id, partial)
deleteOffer(id)
setSubscription(plan)
```

### `useAdminStore`
```js
pendingBusinesses: []
approvedBusinesses: []
approveBusiness(id)        // Mueve de pending → approved
rejectBusiness(id)         // Elimina de pending
stats: { totalUsers, activeFamilies, activeBusinesses, monthlyRevenue }
```

### `usePlansStore`
```js
allPlans: mockPlans
searchQuery: ''
activeCategory: 'Todos'
activeFilters: []           // Filtros de servicios (AND)
ageFilters: []              // Filtros de edad (OR)

setSearchQuery(q)
setActiveCategory(cat)
toggleFilter(filter)
toggleAgeFilter(age)
getFilteredPlans()          // Filtra y ordena por subscriptionTier
getPlanById(id)
```

**Orden de filtrado en `getFilteredPlans()`:**
1. Categoría activa
2. `searchQuery` sobre `title` y `location`
3. `activeFilters` — todos deben coincidir con los tags (AND)
4. `ageFilters` — basta con uno válido (OR), comparando `plan.ageRange`
5. Ordenación final: Premium > Pro > Base > None

---

## Datos mock

### `mockPlans` — 5 planes

| id | Título | Categoría | Tier |
|---|---|---|---|
| 1 | Guggenheim Txiki | Museos | Premium |
| 2 | Parque de Doña Casilda | Parques | None |
| 3 | Taller de Cerámica Familiar | Talleres | Pro |
| 4 | Ruta Bosque de Oma | Naturaleza | Base |
| 5 | Restaurante TxokoKids | Restaurantes | Premium |

Campos por plan: `id`, `title`, `location`, `category`, `price`, `rating`, `reviews`, `distance`, `ageRange`, `tags[]`, `isIdeal`, `subscriptionTier`, `description`, `image`.

### `MOCK_USERS` — 3 usuarios

| Rol | Email |
|---|---|
| `family` | `familia.agirre@example.com` |
| `business` | `info@txikipark.com` |
| `admin` | `admin@txikiplan.com` |

---

## Sistema de estilos

**Archivo principal:** `src/styles/index.css` (~5.500 líneas, CSS nesting nativo)

### Design tokens principales

```css
--font-body:    'Inter', sans-serif
--font-display: 'Montserrat', sans-serif

--spacing-xs / sm / md / lg / xl
--spacing-margin-mobile
--spacing-container-max

/* Colores Material Design 3 */
--primary / --on-primary / --primary-container / --on-primary-container
--secondary / --on-secondary / --secondary-container
--tertiary / --tertiary-container
--surface / --on-surface / --surface-container-lowest → highest
--on-surface-variant / --outline / --outline-variant
--error / --background
```

### Clases globales clave

| Clase | Descripción |
|---|---|
| `.material-symbols-outlined.fill` | Activa FILL 1 en iconos |
| `.btn-primary` / `.btn-primary-full` / `.btn-primary-large` | Botones primarios |
| `.btn-outline-large` / `.btn-outline-secondary` | Botones outline |
| `.status-message` | Feedback inline de confirmación |
| `.subscription-toast` | Toast flotante animado (keyframe `toastIn`) |
| `.subscription-card.active` | Tarjeta de plan con borde primario |
| `.subscription-active-badge` | Badge "Plan actual" verde |
| `.menu-user-info` / `.menu-user-avatar` | Bloque de usuario en drawer |
| `.menu-item-danger` | Ítem de menú en rojo (logout) |
| `.menu-item-icon` | Icono alineado en items del drawer |
| `.bottom-nav` / `.nav-link` / `.nav-label` | Barra de navegación inferior |

---

## Flujo de autenticación (mock)

```
Usuario introduce email en LoginForm
       ↓
¿Coincide con MOCK_USERS por email?
  Sí → usa role de MOCK_USERS
  No → ¿contiene "admin"?     → role: "admin"
       ¿contiene "negocio"/
        "business"/"info"?    → role: "business"
       Por defecto            → role: "family"
       ↓
useAuthStore.login(role)
set({ user: MOCK_USERS[role] })
       ↓
Redirección:
  family   → /planes
  business → /negocio/dashboard
  admin    → /admin
```

---

## Pendiente de implementar

> Según `AGENTS.md`, estas funcionalidades llegan en ramas posteriores:

- ❌ Autenticación real (JWT / backend)
- ❌ Modelos Prisma y CRUD conectado a PostgreSQL
- ❌ Mapa interactivo de planes
- ❌ Recomendador "Family Score"
- ❌ Métricas con datos reales desde backend
- ❌ Sistema de mailing real
- ❌ Tests (carpeta `tests/` preparada)
- ❌ Servicios de API (carpeta `services/` preparada)
- ❌ Contextos React (carpeta `context/` preparada)
- ❌ Hooks personalizados (carpeta `hooks/` preparada)
- ❌ Nombre de marca definitivo (provisional: "TxikiPlan")
