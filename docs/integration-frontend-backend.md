# Plan de integración Frontend ↔ Backend · DESAFIO-26

Plan de conexión entre `feature/frontend` y `feature/backend`. **Documento de planificación**:
no implementa nada todavía y **no toca frontend** en este ciclo.

> Estado actual: el frontend usa datos mock propios (`frontend/src/mocks/data.js`) y **no**
> consume la API real. El backend sirve mock en memoria bajo `/api`. Ambos lados van por
> separado y se integrarán cuando frontend y backend estén terminados (no se mergea a `dev` antes).

## Divergencia actual (riesgo P1)

- Los planes del frontend **no están alineados 1:1** con los IDs/shape del backend.
- El frontend no usa `VITE_API_URL`; consume mocks locales.
- Nombres/campos pueden diferir entre `frontend/src/mocks/data.js` y el contrato `docs/api.md`.

## Mapeo de pantallas críticas → endpoints

| Pantalla (ruta frontend) | Endpoint backend | Notas |
|---|---|---|
| `/planes` (lista) | `GET /api/activities` | Solo `approved`. Alinear campos a `docs/api.md`. |
| `/planes/:id` (detalle) | `GET /api/activities/:id` | 404 si no existe o no aprobada. |
| `/planes` con filtros / recomendación | `GET /api/recommendations` | Query: `childrenAges,strollerFriendly,rainSuitable,budget,municipality`. Devuelve `{activity,score,reasons}`. |
| Asistente (si hay UI) | `POST /api/assistant/family-plan` | Fallback sin IA (`mode:"fallback"`). |
| `/favoritos` | `GET/POST/DELETE /api/favorites` | Sin auth: usuario mock único. |
| Detalle → reseña | `POST /api/reviews` | Entra `pending`. |
| Detalle → incidencia | `POST /api/incidents` | Entra `open`. |

## Pasos recomendados (cuando se aborde, fuera de este ciclo)

1. Definir `VITE_API_URL` en `frontend/.env.example` y un cliente axios central (`src/services/api.js`).
2. Alinear el shape de `frontend/src/mocks/data.js` con `docs/api.md` (o mapear en la capa de servicios).
3. Conectar primero `/planes` y `/planes/:id` (lectura), luego `/recomendaciones`, luego favoritos/reseñas/incidencias (escritura).
4. Añadir estados loading/error/empty en las pantallas conectadas.
5. Tests de integración mínimos de las pantallas críticas (zona 80).

## Restricciones

- Este documento **no** modifica frontend ni backend.
- La integración real **no** se mergea a `dev` hasta que frontend y backend estén terminados.

Referencias: [api.md](api.md), [quality/README.md](quality/README.md).
