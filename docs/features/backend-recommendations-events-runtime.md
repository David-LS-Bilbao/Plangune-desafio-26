# Feature · Migración de recomendaciones a events runtime

- **Fecha:** 2026-06-03
- **Rama:** `feat/backend-recommendations-events-runtime` (desde `feature/backend`)
- **Estado:** implementada · tests 46/46 verdes · pendiente de PR a `feature/backend`

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Contexto previo

| Estado antes de esta rama | Detalle |
|---|---|
| `/api/events` y `/:id` | Ya usan Prisma/PostgreSQL runtime (rama `feat/backend-events-prisma-runtime`) |
| `/api/recommendations` | Seguía usando `activities` mock en memoria (`activity.service.js` → `mockActivities.js`) |
| Frontend y tests | Esperan la clave `activity` en cada item del array de recomendaciones |

---

## Cambio realizado

`GET /api/recommendations` ya **no usa `activities` mock**. Ahora obtiene todos los eventos
de PostgreSQL via `event.repository.js` (Prisma) y calcula el Family Score sobre campos
reales de la tabla `events`.

### Archivos modificados

| Archivo | Operación | Descripción |
|---|---|---|
| `backend/src/services/recommendation.service.js` | **Reemplazado** | Async; usa `findEvents({})`; scoring sobre campos de `events`; alias `activity` temporal |
| `backend/src/controllers/recommendation.controller.js` | **Mínimo** | Solo añadido `await` |
| `backend/src/services/assistant.service.js` | **Propagación** | Añadido `async`/`await` porque usa `getRecommendations` que ahora es async |
| `backend/src/controllers/assistant.controller.js` | **Propagación** | Añadido `await` a `getFamilyPlanFallback` |
| `backend/src/tests/recommendations.test.js` | **Actualizado** | `vi.mock` del repository; tests del nuevo shape + filtros |
| `backend/src/tests/assistant.test.js` | **Actualizado** | Añadido `vi.mock` del repository; añadido check de clave `event` |

No se crea `recommendation.repository.js` nuevo: el recomendador reutiliza `findEvents({})` del
repositorio existente (`event.repository.js`), que encapsula el acceso a Prisma.

### Arquitectura aplicada

```
GET /api/recommendations
  → recommendation.controller.js  (parsea query, await)
    → recommendation.service.js   (scoring + reasons)
      → event.repository.js       (findEvents({}) → Prisma)
        → PostgreSQL / tabla events

POST /api/assistant/family-plan
  → assistant.controller.js  (await)
    → assistant.service.js   (await, fallback sin IA)
      → recommendation.service.js  (misma cadena que arriba)
```

---

## Shape de respuesta

La respuesta mantiene **compatibilidad total** con el frontend actual mediante el alias
temporal `activity`, y añade `event` como la nueva clave recomendada:

```json
[
  {
    "event": {
      "id": 1,
      "title": "Exposición interactiva en el museo",
      "municipio": "Bilbao",
      "es_carrito": true,
      "es_lluvia": true,
      "edad_minima": 0,
      "price": "Gratis"
    },
    "activity": { "...mismo objeto que event..." },
    "score": 100,
    "reasons": [
      "Apto para la edad de tus peques (edad mínima: 0 años)",
      "Accesible con carrito",
      "Buen plan si llueve (a cubierto)",
      "Cerca de Bilbao",
      "Dentro de tu presupuesto (Gratis)"
    ]
  }
]
```

### Compatibilidad con frontend

| Clave | Propósito | Acción requerida |
|---|---|---|
| `event` | **Nueva clave principal** — shape real de `events` (snake_case) | Frontend debe migrar a consumir esta clave |
| `activity` | **Alias temporal legacy** — mismo objeto que `event` | No retirar hasta que frontend confirme migración |

---

## Scoring aplicado

| Criterio | Campo `events` | Bonus | Razón mostrada |
|---|---|---|---|
| Edad (peque más pequeño) | `edad_minima <= min(childrenAges)` | +20 | "Apto para la edad de tus peques (edad mínima: N años)" |
| Acceso con carrito | `es_carrito === true` | +10 | "Accesible con carrito" |
| Plan a cubierto/lluvia | `es_lluvia === true` | +10 | "Buen plan si llueve (a cubierto)" |
| Cercanía | `municipio.includes(municipality)` case-insensitive | +10 | "Cerca de X" |
| Presupuesto | `parsePrice(price) <= budget` | +10 | "Dentro de tu presupuesto (X €)" |
| Score base | — | 50 | — |
| Score máximo | — | 100 (cap) | — |

### `parsePrice(price)` — parseo de presupuesto

`price` es un campo string libre en `events`. Reglas de parseo:

| Valor | Resultado |
|---|---|
| `"Gratis"` | `0` |
| `"8 €"`, `"12 €"`, `"10€"` | `8`, `12`, `10` (primer número del string) |
| Cualquier otro | `null` → **no suma ni penaliza** |

### Decisiones de scoring

- **`averageRating` eliminado**: no existe en `events`. No se inventa.
- **`multiplicador` no usado**: el campo existe en `events` pero sin decisión documentada sobre su uso para scoring. Pendiente de evaluar como boost técnico/promocional.
- **Criterio de edad**: `edad_minima <= min(childrenAges)` — el evento es apto para el peque más joven del grupo. Si hay peques de edades distintas, se usa el de menor edad para ser conservador.

---

## Qué NO cambia

- `docs/data/schema-real/init.sql` — no se toca.
- `backend/prisma/schema.prisma` — no se toca.
- Migraciones existentes — no se tocan.
- `seed.js` — no se toca.
- Frontend — no se toca.
- Auth — no se toca.
- Assistant/IA — solo `async`/`await` de propagación; la lógica y el contrato son idénticos.
- Favorites, reviews, incidents, plans — no se tocan.
- El contrato público de `/api/recommendations` (URL, parámetros de query) — **estable**.

---

## Cómo probar

### Tests (sin DB real)

```bash
npm run prisma:generate --workspace backend
npm run test:backend
# → 9 suites · 46/46 tests verdes
```

Los tests usan `vi.mock('../repositories/event.repository.js')` — el repository se sustituye
por una implementación en memoria que devuelve `mockEvents`. No se necesita PostgreSQL.

### Smoke manual (requiere DB local)

```bash
# 1. Levantar PostgreSQL y sembrar datos
docker compose up -d postgres
npm run prisma:migrate --workspace backend
npm run db:seed --workspace backend

# 2. Arrancar el backend
npm run dev:backend

# 3. Probar recomendaciones
curl http://localhost:3000/api/recommendations

curl "http://localhost:3000/api/recommendations?childrenAges=2&strollerFriendly=true&rainSuitable=true&municipality=Bilbao&budget=20"

# 4. Verificar que el asistente también usa events reales
curl -X POST http://localhost:3000/api/assistant/family-plan \
  -H "Content-Type: application/json" \
  -d '{"childrenAges":[2],"strollerFriendly":true,"rainSuitable":true,"municipality":"Bilbao","budget":20}'
```

---

## Validación ejecutada

```
npm run prisma:generate --workspace backend  →  ✔ Prisma Client (v6.19.3)
npm run test:backend                         →  9 suites · 46 tests · verdes

curl /api/recommendations?childrenAges=2&strollerFriendly=true&rainSuitable=true
     &municipality=Bilbao&budget=20
→  3 recomendaciones · scores=[100,100,100]
   item.event_key=True · item.activity_key=True (alias funciona)
   reasons=[5,4,4] razones respectivamente

curl /api/recommendations (sin contexto)
→  3 items · scores=[50,50,50] · event_key=True · activity_key=True
```

---

## Riesgos y limitaciones

- **`price` es string libre**: el presupuesto es **aproximado**. Valores no parseables no suman ni penalizan. No bloquea la demo, pero si los eventos reales usan formatos variados el criterio de presupuesto puede ser poco fiable.
- **Sin rating medio real**: `events` no tiene valoración media. El scoring actual no incluye este criterio. Añadirlo requerirá una tabla de valoraciones y lógica nueva.
- **Sin `status` en events**: los eventos no tienen estado `approved`/`pending`. El recomendador devuelve todos los eventos de la DB. No hay filtrado por moderación en este endpoint.
- **`multiplicador` no usado**: existe en `events` pero se ignora deliberadamente hasta que haya una decisión sobre su semántica.
- **Alias `activity` es deuda temporal**: debe retirarse en una rama futura, después de que el frontend confirme que consume `event`.
- **Dependencia de DB real**: `/api/recommendations` en runtime requiere PostgreSQL levantado y sembrado. Sin DB, el endpoint falla. Los tests siempre funcionan sin DB (repositorio mockeado).

---

## Siguiente paso recomendado

1. **Frontend migra a consumir `event`** en lugar de `activity`.
2. **Retirar el alias `activity`** en una rama de limpieza (`chore/recommendations-remove-activity-alias`) una vez el frontend confirme.
3. O bien, **migrar favoritos** para que también usen `events` reales (rama separada).

---

## Referencias

- [ADR-0001 · Prisma no-runtime](../adr/0001-prisma-preparado-no-runtime.md)
- [ADR-0004 · Fuente de verdad del schema](../adr/0004-real-schema-source-of-truth.md)
- [Feature events runtime](backend-events-prisma-runtime.md)
- [Contrato API](../api.md)
- [Guía de DB local](../database.md)
