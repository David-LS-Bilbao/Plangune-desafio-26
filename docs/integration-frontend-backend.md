# Plan de integración Frontend ↔ Backend · DESAFIO-26

Plan de conexión (mapeo pantalla → endpoint) entre `feature/frontend` y `feature/backend`.
**Documento de planificación**: no implementa nada todavía y **no toca frontend** en este ciclo.

> **Contrato (fuente de verdad):** [contracts/frontend-backend-api-contract.md](contracts/frontend-backend-api-contract.md).
> **Flujo de integración:** [integration/frontend-backend.md](integration/frontend-backend.md).
> Cualquier tarea que consuma o modifique API debe consultar el contrato **antes de tocar código**.

> Estado actual: el frontend aún no consume la API real (usa datos propios mientras se desarrolla).
> El backend ya sirve `events` y favoritos vía Prisma/PostgreSQL, `recommendations` con Data+fallback
> y el asistente con LLM+fallback. Ambos lados van por separado y se integrarán cuando estén
> terminados (no se mergea a `dev` antes).

## Divergencia actual (riesgo P1)

- Los planes del frontend **no están alineados 1:1** con los IDs/shape del backend (`events`, snake_case).
- El frontend todavía no usa `VITE_API_URL` para consumir Express.
- Nombres/campos pueden diferir entre los datos del frontend y el contrato.

## Mapeo de pantallas críticas → endpoints

> **Entidad central: `events`** (no `activities`). El endpoint `/api/activities` es mock legacy y
> **no** debe usarse para las pantallas nuevas. Shapes y params: ver el contrato.

| Pantalla (ruta frontend) | Endpoint backend | Notas |
|---|---|---|
| `/planes` (lista) | `GET /api/events` | Array de eventos. Filtros snake_case (`municipio`, `es_carrito`, `edad`...). |
| `/planes/:id` (detalle) | `GET /api/events/:id` | 404 si no existe. |
| `/planes` con filtros / recomendación | `GET /api/recommendations` | Query: `childrenAges,municipality,strollerFriendly,changingTable,rainSuitable,budget,limit`. Devuelve `{event,activity(alias),score,reasons,source}`. |
| Asistente (si hay UI) | `POST /api/assistant/family-plan` | Modo IA (`assistantMessageMarkdown`) o fallback (`mode:"fallback"`). |
| `/favoritos` | `GET/POST/DELETE /api/favorites/:activityId` | Ruta pública `:activityId`; respuesta con `eventId`+`activityId`. Sin auth: usuario mock único. |
| Detalle → reseña | `POST /api/reviews` | Mock legacy. Entra `pending`. |
| Detalle → incidencia | `POST /api/incidents` | Mock legacy. Entra `open`. |

## Pasos recomendados (cuando se aborde, fuera de este ciclo)

1. Definir `VITE_API_URL` en `frontend/.env.example` y un cliente axios central (`src/services/api.js`).
2. Alinear el shape de los datos del frontend con el [contrato](contracts/frontend-backend-api-contract.md) (`events`, snake_case), o mapear en la capa de servicios.
3. Conectar primero `/planes` y `/planes/:id` (lectura sobre `/api/events`), luego `/recomendaciones`, luego favoritos/reseñas/incidencias (escritura).
4. Añadir estados loading/error/empty en las pantallas conectadas.
5. Tests de integración mínimos de las pantallas críticas (zona 80).

## Restricciones

- Este documento **no** modifica frontend ni backend.
- La integración real **no** se mergea a `dev` hasta que frontend y backend estén terminados.

Referencias: [contrato FE↔BE](contracts/frontend-backend-api-contract.md), [flujo de integración](integration/frontend-backend.md), [api.md](api.md), [quality/README.md](quality/README.md).
