# Feature · Data Recommender como fuente principal de `/api/recommendations`

- **Fecha:** 2026-06-03
- **Rama:** `feat/backend-data-recommender-primary` (desde `feature/backend`)
- **Estado:** integrada en `feature/backend` · validada con fallback local y Data externo · tests backend 91/91 verdes
- **Spec:** [../agents/data-recommender-primary-integration.md](../agents/data-recommender-primary-integration.md)

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Qué cambia

`GET /api/recommendations` pasa a usar la **API de Data (Flask)** como **recomendador principal**,
y el **recomendador local** (Family Score sobre `events` de Prisma/PostgreSQL) queda como
**fallback** técnico.

- **Data como fuente principal**: si `DATA_RECOMMENDER_ENABLED=true`, Express llama a `GET {DATA_API_URL}/planes`.
- **Fallback local**: si Data está deshabilitado, falla, agota timeout, devuelve 5xx, o responde algo vacío/inválido → se usa el recomendador local.
- **Express sigue siendo la única API pública**: el frontend **nunca** llama a Flask/Data directamente.
- **Contrato estable**: el shape de cada item se mantiene; se añade el campo `source`.
- **Límite estable**: Express devuelve **como máximo 3** por defecto (o el valor de `limit`), también cuando Data responde OK. A Data se le envía siempre `limite = limit ?? 3` y, tras mapear, Express aplica `slice(0, limit ?? 3)` por seguridad.
- **Campo DB actualizado**: el campo interno de eventos para planes interiores/a cubierto es `es_interior`; la migración incremental `20260603165855_rename_es_lluvia_to_es_interior` renombra la columna sin pérdida de datos.

---

## Arquitectura

```
GET /api/recommendations
  → recommendation.controller.js  (parsea query → context)
    → recommendation.service.js   (getRecommendations: Data primero, fallback local)
        ├─ Data ON  → dataRecommender.client.js → fetch GET {DATA_API_URL}/planes
        └─ fallback → event.repository.js → Prisma/PostgreSQL (Family Score local)
```

- **`backend/src/clients/dataRecommender.client.js`** (nuevo): `fetch` nativo de Node + `AbortController` para timeout. Sin axios.
- **`backend/src/services/recommendation.service.js`**: `getLocalRecommendations(context)` (lógica local) + `getRecommendations(context)` (orquesta Data/fallback).

---

## Variables de entorno

| Variable | Por defecto (`.env.example`) | Descripción |
|---|---|---|
| `DATA_RECOMMENDER_ENABLED` | `false` | `true` activa Data como recomendador principal |
| `DATA_API_URL` | `http://localhost:5000` | Base URL de la API Flask de Data |
| `DATA_API_TIMEOUT_MS` | `2000` | Timeout de la llamada a Data (ms) |

Data vive en el repo externo `Desafio-Data`. Puertos locales habituales:

```env
# Windows/Linux
DATA_RECOMMENDER_ENABLED=true
DATA_API_URL=http://localhost:5000

# Mac (AirPlay/Control Center puede ocupar 5000)
DATA_RECOMMENDER_ENABLED=true
DATA_API_URL=http://localhost:5050
```

> Se deja en **`false`** por defecto para que el backend use directamente el fallback local si Data
> no está levantado. Con `true` y Data caída, cada petición esperaría el timeout antes del fallback.

---

## Mapeo de filtros Express → Data

| Context (Express) | Query param (Data `/planes`) |
|---|---|
| `municipality` | `ubicacion` |
| `childrenAges` | `edad_max` = `min(childrenAges)` |
| `rainSuitable` | `lluvia` |
| `strollerFriendly` | `carrito` |
| `changingTable` | `cambiador` |
| `wheelchairAccessible` | `silla_ruedas` |
| `petsAllowed` | `mascotas` |
| `includeKulturklik` | `kulturklik` |
| `limit` | `limite` |

El `recommendation.controller.js` parsea **todos** estos filtros desde la query string
(los existentes `childrenAges/strollerFriendly/rainSuitable/budget/municipality` **siguen
funcionando igual**, sin romper el contrato actual) y el service los mapea a los params de Data.
Los filtros adicionales son opcionales: si no vienen en la query, no se envían.

> Nota de contrato: aunque la DB usa `events.es_interior`, hacia Data se mantiene `lluvia`
> porque ese es el parámetro vigente de `GET /planes`.

---

## Shape de respuesta (estable)

Cada item:

```json
{
  "event": { },
  "activity": { },
  "score": 3,
  "reasons": ["..."],
  "source": "data-api"
}
```

- **`source: "data-api"`** cuando la recomendación viene de Data.
- **`source: "local-fallback"`** cuando viene del recomendador local.
- **`activity`** es **alias legacy** de `event` (mismo objeto), mantenido hasta que el frontend migre a `event`.

### Respuesta de Data aceptada

El backend normaliza la respuesta de Data antes de mapear:

- **Formato principal:** `{ "total": number, "filtros": {}, "resultados": [] }` → se usan `resultados`.
- **Array directo** `[ ... ]` → aceptado de forma defensiva.
- **Inválida / vacía / sin `resultados` válidos** → **fallback local**.

### Data → item

Cada "plan" de Data (de `resultados`) se mapea a
`{ event: plan, activity: plan, score, reasons, source: "data-api" }`.
Si el plan no trae `score` numérico se usa `3`; si no trae `reasons` se usa `["Recomendado por el servicio Data"]`.

### Fallback local → item

El recomendador local conserva su **Family Score explicable** (score y `reasons` reales) y añade `source: "local-fallback"`.

---

## Cómo probar

### Con Data APAGADO (por defecto)

```bash
# DATA_RECOMMENDER_ENABLED=false (o sin definir)
npm run dev:backend
curl "http://localhost:3000/api/recommendations?childrenAges=2&strollerFriendly=true&municipality=Bilbao"
# → items con "source": "local-fallback"
```

### Con Data ENCENDIDO

```bash
# En backend/.env:
#   DATA_RECOMMENDER_ENABLED=true
#   DATA_API_URL=http://localhost:5000   # Windows/Linux
#   DATA_API_URL=http://localhost:5050   # Mac si 5000 está ocupado por AirPlay
# (requiere la API Flask de Data corriendo en esa URL)
npm run dev:backend
curl "http://localhost:3000/api/recommendations?municipality=Bilbao&childrenAges=2"
# → items con "source": "data-api" (o "local-fallback" si Data falla)
```

### Tests (sin Flask ni DB reales)

```bash
npm run prisma:generate --workspace backend
npm run test:backend
# → 11 suites · 91/91 verdes
```

Los tests mockean el cliente de Data (`dataRecommender.client.js`) y el repositorio de eventos
(`event.repository.js`). Cubren: Data deshabilitado → local; Data OK → `data-api`; timeout/error
→ local; 503 → local; respuesta vacía/inválida → local; alias `activity` mantenido.

---

## Limitaciones

- **Shape de Data:** se acepta `{ total, filtros, resultados }` (principal) o un array directo. Cualquier otra cosa (objeto sin `resultados`, null, vacío) → fallback local.
- **`budget` no se envía a Data**: la API de Data no tiene un param de presupuesto en su contrato; `budget` solo lo usa el recomendador local.
- **Sin caché**: cada petición con Data ON hace una llamada HTTP a Flask.
- **`source` añadido al contrato**: el frontend puede ignorarlo (no rompe), pero conviene que lo use para distinguir el origen.
- **El asistente** (`/api/assistant/family-plan`) reutiliza `getRecommendations`, así que también se beneficia de Data/fallback de forma transparente.

---

## Pendiente

- Mantener documentada la coordinación con el repo externo `Desafio-Data` y sus puertos locales
  (`5000` Windows/Linux, `5050` Mac cuando AirPlay ocupa `5000`).
- Confirmar con Data el **contrato exacto de cada "plan"** dentro de `resultados` (campos disponibles, si traen `score`/`reasons` propios) y afinar el mapper si procede.
- Cuando el frontend migre a `event`, retirar el alias `activity`.

---

## Referencias

- [Spec de integración](../agents/data-recommender-primary-integration.md)
- [Feature recommendations runtime (local)](backend-recommendations-events-runtime.md)
- [Contrato API](../api.md)
- [Docker backend](../docker-backend.md)
