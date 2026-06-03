# Feature · Migración de favoritos a events runtime

- **Fecha:** 2026-06-03
- **Rama:** `feat/backend-favorites-events-runtime` (desde `feature/backend`)
- **Estado:** implementada · tests 50/50 verdes · smoke real OK · pendiente de PR a `feature/backend`

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Qué cambia

`GET/POST/DELETE /api/favorites` dejan de usar un `Set` en memoria + `activities` mock y pasan
a persistir en **PostgreSQL** sobre la tabla real **`user_favorite_events`** (modelo Prisma
`UserFavoriteEvent`, PK compuesta `user_id + event_id`).

| Antes | Ahora |
|---|---|
| `favorite.service.js` con `Set` en memoria | Persistencia en `user_favorite_events` vía Prisma |
| Dependía de `activity.service.js` / `mockActivities` | Usa `event.repository.js` (eventos reales) |
| Se reiniciaba al reiniciar el proceso | Persistente en la DB |
| GET devolvía activities mock | GET devuelve **eventos reales** |

---

## Qué NO cambia

- **Rutas idénticas** (compatibilidad frontend): `GET /api/favorites`, `POST /api/favorites/:activityId`, `DELETE /api/favorites/:activityId`.
- `init.sql`, `schema.prisma`, migraciones existentes — no se tocan.
- `event.repository.js` — solo se **importa** (`findEventById`), no se modifica.
- Frontend, auth, assistant/IA, recommendations, reviews/incidents/plans — no se tocan.
- `activity.service.js` / `mockActivities.js` siguen existiendo para `/api/activities`.

---

## Tabla usada: `user_favorite_events`

```
user_favorite_events
├── user_id   (FK → users.id, parte de PK)
├── event_id  (FK → events.id, parte de PK)
└── saved_at  (timestamp, default now())
PK compuesta: (user_id, event_id)
```

La PK compuesta garantiza que un usuario no pueda tener el mismo evento dos veces:
la idempotencia del `POST` se apoya en `upsert` sobre esa clave.

---

## Usuario mock temporal

Como **todavía no hay auth**, los favoritos se asocian a un usuario family fijo:

```js
export const MOCK_FAMILY_USER_ID = 100; // backend/src/services/favorite.service.js
```

El **seed crea ese usuario** (`backend/prisma/seed.js`):

```js
const demoFamilyUser = { id: 100, email: 'familia@demo.eus', password: 'seed-demo-no-real-family', role: 'family' };
```

- Es de rol `family` (no se reutilizan los usuarios `business` 1–5).
- El seed es idempotente y `syncSequences()` ya cubre la secuencia de `users`
  (con id 100 presente, el próximo user automático será 101).

> Cuando exista auth, `MOCK_FAMILY_USER_ID` se sustituirá por el id del usuario autenticado.

---

## Compatibilidad `activityId` → `eventId`

Las rutas conservan el parámetro `:activityId`, pero **internamente se trata como `eventId`**.
La respuesta incluye **ambas claves** para no romper el frontend actual:

### `POST /api/favorites/:activityId` → `201`

```json
{ "eventId": 1, "activityId": 1, "favorited": true }
```

### `DELETE /api/favorites/:activityId` → `200`

```json
{ "eventId": 1, "activityId": 1, "favorited": false, "removed": true }
```

### `GET /api/favorites` → `200`

Array de **eventos reales** (shape de la tabla `events`, snake_case):

```json
[
  {
    "id": 1,
    "title": "Exposición interactiva en el museo",
    "municipio": "Bilbao",
    "es_carrito": true,
    "es_interior": true,
    "edad_minima": 0,
    "price": "Gratis"
  }
]
```

> ⚠️ **`activityId` es un alias legacy temporal.** La clave canónica nueva es `eventId`.
> No retirar `activityId` hasta que el frontend confirme migración.

---

## Arquitectura

```
controller (fino, await)
  → service (valida id, comprueba evento, construye shape eventId+activityId, serializa)
    → favorite.repository (Prisma: userFavoriteEvent.findMany / upsert / deleteMany)
      → PostgreSQL / tabla user_favorite_events
```

- **Repository** (`favorite.repository.js`):
  - `listFavoriteEventsByUser(userId)` — `findMany({ include: { event: true } })` → array de eventos.
  - `addFavoriteEvent(userId, eventId)` — `upsert` sobre la PK compuesta (idempotente).
  - `removeFavoriteEvent(userId, eventId)` — `deleteMany` (idempotente, devuelve si borró algo).
- **Service** (`favorite.service.js`):
  - Convierte el id a `Number` y valida que sea entero positivo (si no → 404).
  - Comprueba que el evento existe (`findEventById`) antes de añadir; si no → **404 "Evento no encontrado"**.
  - `POST` idempotente (no duplica ni falla); `DELETE` idempotente (no falla si no estaba).
  - Serializa los eventos (Decimal → number, Date → ISO) igual que `/api/events`.
- **Controller** (`favorite.controller.js`): fino, solo `await` + comentario de alias legacy.

---

## Cómo probar

### Tests (sin DB real)

```bash
npm run prisma:generate --workspace backend
npm run test:backend
# → 9 suites · 50/50 tests verdes
```

Los tests mockean `favorite.repository.js` y `event.repository.js` (`vi.mock` declarado antes
de importar `createApp`). El mock de favoritos usa un `Set` en memoria que replica la
idempotencia. **No se necesita PostgreSQL.**

### Smoke manual (requiere DB local)

```bash
docker compose up -d postgres
npm run db:seed --workspace backend       # crea el user family id 100
npm run dev:backend

curl http://localhost:3000/api/favorites                 # []
curl -X POST http://localhost:3000/api/favorites/1       # {eventId:1, activityId:1, favorited:true}
curl http://localhost:3000/api/favorites                 # [ {id:1, title:..., ...} ]
curl -X DELETE http://localhost:3000/api/favorites/1     # {eventId:1, ..., favorited:false, removed:true}
```

---

## Validación ejecutada

```
npm run prisma:generate --workspace backend  →  ✔ Prisma Client (v6.19.3)
npm run db:seed --workspace backend          →  6 users (5 business + 1 family/100), 5 businesses, 10 events
npm run test:backend                         →  9 suites · 50/50 tests verdes

Smoke real (PostgreSQL):
  GET inicial            → []
  POST /1                → {eventId:1, activityId:1, favorited:true}  (201)
  GET                    → [ {id:1, title:'Exposición...', es_carrito:true, lat:43.2645 (number)} ]
  POST /1 otra vez       → 201, GET sigue con 1 favorito (idempotente)
  POST /999999           → 404 {error:"Evento no encontrado"}
  DELETE /1              → {eventId:1, activityId:1, favorited:false, removed:true}  (200)
  GET final              → []
```

---

## Limitaciones

- **Usuario mock único**: todos los favoritos van al usuario family id 100 mientras no haya auth. No hay separación por usuario real.
- **Requiere DB local** para runtime; sin PostgreSQL, los endpoints fallan. Los tests no la requieren (repos mockeados).
- **`activityId` es deuda temporal**: alias legacy a retirar cuando el frontend migre a `eventId`.
- **Serializador duplicado**: `serializeEvent` se repite en event/recommendation/favorite service (~12 líneas). Candidato a extraer a `utils/` en una limpieza futura (fuera de alcance aquí para no tocar otros services).

---

## Siguiente paso recomendado

1. **Conectar con auth real** cuando exista: sustituir `MOCK_FAMILY_USER_ID` por el usuario autenticado.
2. **Frontend migra a `eventId`**; después retirar el alias `activityId` (rama de limpieza).
3. Opcional: extraer `serializeEvent` a `backend/src/utils/serializeEvent.js` y reutilizarlo en los tres services.

---

## Referencias

- [ADR-0001 · Prisma no-runtime](../adr/0001-prisma-preparado-no-runtime.md)
- [ADR-0004 · Fuente de verdad del schema](../adr/0004-real-schema-source-of-truth.md)
- [Feature events runtime](backend-events-prisma-runtime.md)
- [Feature recommendations runtime](backend-recommendations-events-runtime.md)
- [Contrato API](../api.md)
- [Guía de DB local](../database.md)
