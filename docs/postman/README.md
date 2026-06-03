# Pruebas manuales Postman · Backend runtime DESAFIO-26

## 1. Objetivo

Esta colección permite **validar manualmente el estado actual del backend** sin depender de
explicaciones por chat. Cubre:

- endpoints que ya usan **Prisma/PostgreSQL real** (`/events`, `/recommendations`, `/favorites`);
- endpoints **mock/legacy** que siguen activos pero no persisten en DB (`/activities`, `/reviews`, `/incidents`);
- la **compatibilidad temporal** con los aliases legacy `activity` (en recommendations) y `activityId` (en favorites);
- el **asistente** en modo fallback reglado (sin IA externa real).

Complementa la auditoría [../audits/backend-db-runtime-audit.md](../audits/backend-db-runtime-audit.md).

## 2. Archivos incluidos

| Archivo | Qué es |
|---|---|
| `DESAFIO-26-backend-runtime.postman_collection.json` | Colección (15 requests en 6 carpetas, con tests) |
| `DESAFIO-26-local.postman_environment.json` | Environment local (`baseUrl = http://localhost:3000/api`) |
| `README.md` | Este documento |

## 3. Estado actual cubierto por la colección

| Bloque | Endpoint | Estado |
|---|---|---|
| Health | `GET /api/health` | real (Express) |
| Events | `GET /api/events` | Prisma/PostgreSQL |
| Events | `GET /api/events/:id` | Prisma/PostgreSQL |
| Recommendations | `GET /api/recommendations` | Prisma/PostgreSQL sobre `events` |
| Favorites | `GET/POST/DELETE /api/favorites` | Prisma/PostgreSQL `user_favorite_events` |
| Activities | `GET /api/activities` | mock legacy |
| Reviews | `POST /api/reviews` | mock |
| Incidents | `POST /api/incidents` | mock |
| Assistant | `POST /api/assistant/family-plan` | fallback, sin IA externa real |

## 4. Preparación del entorno

```bash
git switch feature/backend
git pull origin feature/backend
docker compose up -d postgres
npm run prisma:generate --workspace backend
npm run prisma:migrate  --workspace backend
npm run db:seed         --workspace backend
npm run dev:backend
```

El backend queda en `http://localhost:3000`. El seed crea: 5 usuarios `business`, **1 usuario
`family` con id 100** (el que usan los favoritos), 5 negocios y 10 eventos.

## 5. Importar en Postman

1. **Import** → arrastra `DESAFIO-26-backend-runtime.postman_collection.json`.
2. **Import** → arrastra `DESAFIO-26-local.postman_environment.json`.
3. Selecciona el environment **`DESAFIO-26 Local`** (selector arriba a la derecha).
4. Verifica que la variable `baseUrl` = `http://localhost:3000/api`.

## 6. Orden recomendado de ejecución

1. **01 Health**
2. **02 Events**
3. **03 Recommendations**
4. **04 Favorites**
5. **05 Legacy/mock**
6. **06 Assistant fallback**

Puedes usar el **Collection Runner** de Postman para ejecutar todo de una vez en este orden.

## 7. Qué valida cada bloque

- **01 Health**: la API responde y se identifica como `DESAFIO-26 API`.
- **02 Events**: lectura desde DB real; `lat` serializado como `number` (no string Decimal); detalle por id; filtros (`municipio`, `es_carrito`). No se asume orden en el listado.
- **03 Recommendations**: scoring sobre `events` reales; cada item trae `event` (clave nueva) y `activity` (alias legacy del mismo objeto), `score` y `reasons`; orden descendente y top explicable.
- **04 Favorites**: persistencia real en `user_favorite_events` con el **usuario mock id=100**; respuesta con `eventId` (nuevo) y `activityId` (alias legacy); flujo add → list → idempotente → delete → 404.
- **05 Legacy/mock**: endpoints aún activos pero **no persistentes**; `activities` devuelve la entidad mock (ids `act-xxx`); `reviews`/`incidents` validan contra el mock (por eso usan `activityId: "act-001"`).
- **06 Assistant**: fallback reglado **sin IA externa**; reutiliza el recomendador sobre `events` reales.

## 8. Tests incluidos en Postman

Cada request valida:

- **status HTTP esperado** (200 / 201 / 404);
- **respuesta JSON** cuando aplica;
- **estructura mínima** (arrays, propiedades clave);
- **campos críticos** (p. ej. `event`/`activity`, `eventId`/`activityId`, `status: pending|open`, `mode: fallback`).

## 9. Notas de contrato importantes

- **Reviews e incidents son mock legacy**: validan contra `mockActivities`, por eso el body usa
  `activityId: "act-001"` (id tipo `act-xxx`), **no** un id de evento numérico. Con un id numérico
  devolverían 404.
- **Assistant — campo `question`**: el body incluye `question` por compatibilidad con la intención
  futura, pero **el endpoint todavía no lo usa**. El fallback se construye con
  `childrenAges` / `municipality` / `strollerFriendly` / `rainSuitable` / `budget`. El campo
  `message` (≤500 caracteres) sí se valida; `question` se ignora. **No es integración IA real todavía.**

## 10. Limitaciones conocidas

- **No hay auth real** todavía.
- **Favorites usa el usuario mock id=100** (mientras no exista auth).
- **`activity` es alias legacy de `event`** (en recommendations).
- **`activityId` es alias legacy de `eventId`** (en favorites).
- **Reviews/incidents NO persisten en DB** (mock en memoria; se pierden al reiniciar el backend).
- **Assistant no llama todavía a Flask/Ollama real**: es un fallback reglado.
- **El orden de ejecución afecta a favoritos**: `POST`/`DELETE` modifican estado. Ejecuta la
  carpeta 04 de arriba abajo. Si la repites, el primer `POST` puede partir de un estado ya añadido
  (sigue siendo idempotente).

## 11. Cómo resetear el estado local si hace falta

```bash
docker compose down -v
docker compose up -d postgres
npm run prisma:migrate --workspace backend
npm run db:seed        --workspace backend
```

> ⚠️ **`docker compose down -v` borra los datos locales** (volumen de PostgreSQL). Úsalo solo si
> quieres partir de cero.

## 12. Relación con la auditoría

Esta colección complementa el informe
[../audits/backend-db-runtime-audit.md](../audits/backend-db-runtime-audit.md), que documenta qué
está en runtime real, qué sigue mock, los aliases temporales y los riesgos.

## 13. Siguiente paso recomendado

- Usar la colección en una **revisión con el equipo** del estado del backend.
- Cuando el **frontend migre de `activity` a `event`** (y de `activityId` a `eventId`),
  actualizar la colección y este README para reflejar la retirada de los aliases.
- Cuando se implemente **auth real**, sustituir las pruebas con el usuario mock id=100 por
  pruebas autenticadas (token en el environment).
