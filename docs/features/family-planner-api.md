# Feature · Planificador familiar conectado a la API real

Rama: `feat/predev-family-planner-api` (hija de `test/integration-frontend-backend-20260605`, pre-dev).

Conecta el **flujo principal de familias** del frontend a la API real de Express, manteniendo la UI
actual y sin rediseños grandes. Sustituye el store mock por llamadas reales **solo en este flujo**.

## Pantallas que pasan de mock a API real

| Pantalla | Antes | Ahora | Endpoint |
|---|---|---|---|
| `/planes` | `usePlansStore` (5 mocks) | `GET /api/events` | lista de eventos |
| `/buscar` | filtrado en cliente sobre mocks | `GET /api/events?<filtros>` | filtros reales |
| `/planes/:id` | `getPlanById` (mock) | `GET /api/events/:id` | detalle real |
| `/favoritos` | `useUserStore` (memoria, se perdía con F5) | `GET/POST/DELETE /api/favorites` | favoritos persistentes |

El resto de pantallas (negocio, admin, perfil, ofertas, login) **siguen usando el store mock**: no se
tocan en esta rama. El store mock no se elimina.

## Arquitectura añadida

- **`frontend/src/services/apiClient.js`** — instancia axios única con `baseURL = VITE_API_URL`.
  Es el único punto de salida HTTP del flujo. Nunca llama a Data, Flask, Ollama, DeepSeek ni APIs
  externas: Express es la fachada.
- **`frontend/src/services/eventsApi.js`** — `fetchEvents(filters)`, `fetchEventById(id)`.
- **`frontend/src/services/favoritesApi.js`** — `fetchFavorites()`, `addFavorite(id)`, `removeFavorite(id)`.
- **`frontend/src/mappers/eventMapper.js`** — `eventToPlan` / `eventsToPlans`: convierten el shape
  backend snake_case al shape que ya consumen `PlanCard` y `PlanDetail` (deriva `location`, `ageRange`,
  `tags`, `image`) manteniendo los campos crudos (booleans de accesibilidad, `lat`/`lng`, fechas).
- **`frontend/src/context/FavoritesContext.jsx`** — estado global de favoritos (área familia).
  Carga `GET /api/favorites` una vez al montar `MainLayout`; `toggleFavorite` es optimista con
  rollback. Es lo que hace que **un F5 no borre favoritos** (la fuente es el backend).
- **`frontend/src/styles/family-planner.css`** — estilos propios (mobile-first) de loading/error/empty,
  botón de favorito en la card y chips de servicios del detalle.

## Campos cubiertos por el mapper

`id`, `title`/`titulo`, `description`/`descripcion`, `municipio`, `territorio`, `fecha`(`fecha_inicio`)
+ `fechaFin`, `price`/`precio`, `category`/`categoria`, `tipoEvento`, `edad_minima`, `edad_maxima`
(*preparado*: el contrato aún no lo expone → `null`), `es_carrito`, `es_cambiador`, `es_interior`,
`es_silla_ruedas`, `es_mascotas`, `imagen_url` (con placeholder si `null`), `latitud`/`longitud`
(`lat`/`lng`), `telefono`, `website`, `address`.

## Filtros de `/buscar` → query params

| UI | Param backend | Notas |
|---|---|---|
| Municipio (texto) | `municipio` | Igualdad case-insensitive (contrato). |
| Territorio (select) | `territorio` | Bizkaia / Gipuzkoa / Araba. |
| Edad (pills) | `edad` | Se envía la edad de referencia máxima seleccionada. |
| Carrito | `es_carrito` | |
| Cambiador | `es_cambiador` | |
| Silla de ruedas | `es_silla_ruedas` | |
| Mascota | `es_mascotas` | |
| Interior | `es_interior` | |
| Gratis | — | Filtro en **cliente** por precio (sin equivalente en el contrato). |
| Tranquilo | — | *Preparado*, sin dato en backend (no rompe UI). |
| Fechas | `fecha_desde`/`fecha_hasta` | *Preparado* en el servicio; la UI aún no expone selector. |

## Decisiones relevantes

- **"Reservar" eliminado** en `/planes/:id`: no hay reservas reales en MVP. El **favorito** es la
  acción principal. Se mantiene "Cómo llegar" (abre Google Maps; es navegación del usuario, no una
  llamada de datos a un servicio externo).
- **Sin gate de login mock** en favoritos: el backend no tiene auth todavía y usa un usuario family
  fijo, así que los favoritos funcionan y persisten sin necesidad de "iniciar sesión".
- **Ficha enriquecida**: el detalle muestra edad, precio, categoría, fecha y un bloque de "Servicios
  familiares" (carrito, cambiador, interior, silla de ruedas, mascotas) con datos reales.
- El bloque de **reseñas** del detalle anterior (mock local) se retiró de la ficha por depender de
  datos inexistentes; reseñas/incidencias reales quedan **fuera del alcance de esta rama**.

## Contrato

No se ha modificado el contrato ni `docs/api.md`: el frontend se limita a **consumir** lo ya
documentado. La ruta de favoritos se invoca como `/favorites/:eventId` (el contrato la declara como
`:activityId`, alias legacy del mismo id de evento entero; uso compatible).

## Tests / checks

- `frontend/src/tests/eventMapper.test.js` (12) y `eventsApi.test.js` (4): nuevos, deterministas.
- `npm run test:frontend` → **24/24** pasan. `npm run build --workspace frontend` → OK.

## Riesgos / pendientes

- Sin auth, los favoritos son globales (usuario mock fijo): no hay "mis favoritos" por usuario real.
- La búsqueda por municipio es **igualdad** (contrato), no texto libre tipo autocompletar.
- Requiere backend levantado + DB con seed; si el backend cae, las pantallas muestran error amable.
- `edad_maxima` y selector de fechas quedan preparados en la capa de datos, pendientes de UI/contrato.
