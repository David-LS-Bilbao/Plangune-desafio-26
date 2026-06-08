# API · DESAFIO-26 (MVP)

Índice/resumen de los endpoints del backend. La **fuente de verdad** del contrato Frontend ↔ Backend
es [contracts/frontend-backend-api-contract.md](contracts/frontend-backend-api-contract.md);
el flujo de integración está en [integration/frontend-backend.md](integration/frontend-backend.md).

> **Estado runtime**: `events` y favoritos se sirven desde **PostgreSQL vía Prisma** cuando la DB
> local está levantada; `recommendations` usa Data API (Flask) con fallback local; el asistente usa
> LLM con fallback local. Las entidades `activities`, reseñas e incidencias siguen siendo **mock en
> memoria** y se reinician al reiniciar el proceso. No hay auth todavía.
> Nombre técnico estable: `DESAFIO-26`. App provisional: *TxikiPlan Euskadi*.

- **Base URL**: `http://localhost:3000/api`
- **Formato**: JSON. Errores con forma uniforme `{ "error": "<mensaje>" }`.
- **Códigos**: `200` OK · `201` creado · `404` no encontrado · `422` validación.

## Salud

### `GET /api/health`
Healthcheck. No requiere DB.

```json
{ "status": "ok", "service": "DESAFIO-26 API" }
```

## Eventos (entidad central · datos reales de `init.sql`)

> Modelo alineado con la tabla `events` de [../backend/src/models/init.sql](../backend/src/models/init.sql)
> (shape real, snake_case). **Fuente runtime actual: Prisma/PostgreSQL** cuando la DB local
> está levantada; ver [features/backend-events-prisma-runtime.md](features/backend-events-prisma-runtime.md).
> **Contrato público estable** — los campos, filtros y códigos HTTP no cambian respecto al mock.
> Los eventos **no** tienen estado de moderación: `GET /api/events` devuelve todos.

### `GET /api/events`
Lista eventos. Responde un **array**. Admite filtros opcionales por query string:

| Filtro | Tipo | Ejemplo | Semántica |
|---|---|---|---|
| `municipio` | string | `Bilbao` | igualdad (case-insensitive) |
| `territorio` | string | `Bizkaia` | igualdad |
| `categoria` | string | `museo` | igualdad |
| `tipo_evento` | string | `taller` | igualdad |
| `es_interior` | boolean | `true` | plan a cubierto / apto si llueve |
| `es_carrito` | boolean | `true` | accesible con carrito |
| `es_cambiador` | boolean | `true` | dispone de cambiador |
| `es_silla_ruedas` | boolean | `true` | accesible con silla de ruedas |
| `es_mascotas` | boolean | `true` | admite mascotas |
| `edad` | entero | `2` | apto si `edad_minima <= edad` |
| `fecha_desde` | ISO 8601 | `2026-07-01` | `fecha_inicio >= fecha_desde` |
| `fecha_hasta` | ISO 8601 | `2026-07-31` | `fecha_inicio <= fecha_hasta` |

Filtros inválidos (booleano mal formado, `edad` no numérica, fecha no ISO) → **422**.

### `GET /api/events/:id`
Detalle de un evento por `id` (entero). `404` si no existe.

Ejemplo de evento (shape real de `events`):

```json
{
  "id": 1,
  "business_id": 1,
  "fuente": "manual",
  "external_id": null,
  "title": "Exposición interactiva en el museo",
  "description": "Sala sensorial para peques con zona de juego y cuentacuentos.",
  "categoria": "museo",
  "tipo_plantilla": null,
  "municipio": "Bilbao",
  "territorio": "Bizkaia",
  "address": "Plaza del Museo, 2",
  "lat": 43.2645,
  "lng": -2.9342,
  "telefono": "944000001",
  "email": null,
  "website": null,
  "es_interior": true,
  "es_carrito": true,
  "es_cambiador": true,
  "es_silla_ruedas": true,
  "es_mascotas": false,
  "edad_minima": 0,
  "multiplicador": 1.0,
  "fecha_inicio": "2026-06-10T10:00:00",
  "fecha_fin": "2026-06-10T13:00:00",
  "lugar": "Museo de Bellas Artes",
  "price": "Gratis",
  "imagen_url": null,
  "tipo_evento": "exposicion"
}
```

## Actividades

> Endpoints **mock previos** (entidad `Activity`). Se mantienen mientras se migra a `events`;
> se retirarán/migrarán en pasos posteriores.

### `GET /api/activities`
Lista las actividades aprobadas. Responde un **array** de actividades.

### `GET /api/activities/:id`
Detalle de una actividad por `id`. `404` si no existe o no está aprobada.

Ejemplo de actividad:

```json
{
  "id": "act-001",
  "title": "Aquarium de Donostia",
  "category": "museo",
  "province": "Gipuzkoa",
  "municipality": "Donostia-San Sebastián",
  "recommendedAgeMin": 0,
  "recommendedAgeMax": 12,
  "priceType": "medium",
  "estimatedFamilyCost": 38,
  "isIndoor": true,
  "rainSuitable": true,
  "strollerFriendly": true,
  "hasToilet": true,
  "hasChangingTable": true,
  "averageRating": 4.6,
  "status": "approved"
}
```

## Recomendaciones (Data primary + fallback local)

### `GET /api/recommendations`
Devuelve **como máximo 3 planes por defecto**, o el número indicado por `limit`.

> **Fuente runtime:** la **API de Data (Flask)** es el recomendador **principal** cuando
> `DATA_RECOMMENDER_ENABLED=true`; si está deshabilitada o falla, se usa el **recomendador local**
> (Family Score sobre `events` de Prisma/PostgreSQL) como **fallback**.
> El frontend **siempre** consume este Express, nunca Flask directamente.
> **Contrato estable**, con un campo nuevo `source` por item.
> Ver [features/backend-data-recommender-primary.md](features/backend-data-recommender-primary.md).
>
> Cada item incluye **`source`**: `"data-api"` (recomendación de Data) o `"local-fallback"`
> (recomendador local). `activity` sigue siendo **alias legacy** de `event`.

Contexto opcional por **query string**:

| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `childrenAges` | lista | `2,5` | Edades de los peques (separadas por comas) |
| `strollerFriendly` | boolean | `true` | Se necesita acceso con carrito |
| `rainSuitable` | boolean | `true` | Llueve / se busca plan a cubierto |
| `budget` | número | `30` | Coste familiar máximo (€) — solo recomendador local |
| `municipality` | string | `Bilbao` | Municipio de referencia (cercanía) |
| `limit` | número | `5` | Máximo de recomendaciones a devolver (por defecto 3) |

> Filtros adicionales aceptados (se reenvían a Data): `changingTable`, `wheelchairAccessible`,
> `petsAllowed`, `includeKulturklik` (booleanos).
>
> Aunque el campo interno de DB actual es `events.es_interior`, Express mantiene `rainSuitable`
> como query pública y lo reenvía a Data como `lluvia`, que es el contrato vigente de `GET /planes`.

Respuesta (array de recomendaciones con explicación):

```json
[
  {
    "event": {
      "id": 1,
      "title": "Exposición interactiva en el museo",
      "municipio": "Bilbao",
      "es_carrito": true,
      "es_interior": true,
      "edad_minima": 0,
      "price": "Gratis"
    },
    "activity": { "...alias legacy de event — mismo objeto..." },
    "score": 100,
    "reasons": [
      "Apto para la edad de tus peques (edad mínima: 0 años)",
      "Accesible con carrito",
      "Buen plan si llueve (a cubierto)",
      "Cerca de Bilbao",
      "Dentro de tu presupuesto (Gratis)"
    ],
    "source": "local-fallback"
  }
]
```

> `source` es `"data-api"` cuando la recomendación procede de la API de Data, o
> `"local-fallback"` cuando procede del recomendador local.

> **Transición de clave:**
> - `event` es la **clave principal nueva** con el shape real de `events` (snake_case).
> - `activity` es un **alias temporal legacy** del mismo objeto, mantenido para no romper el
>   frontend hasta que migre. **No retirar** hasta confirmación del equipo frontend.

> **Normalización de Data:** cuando `source: "data-api"`, Express **normaliza** el plan crudo de Data
> al shape de `events` (`nombre→title`, `descripcion→description`, `direccion→address`, `precio→price`,
> `es_lluvia→es_interior`, booleanos string `"True"/"False"`→boolean, `edad_minima`→número). En ese
> caso **`event.id` puede ser `null`** si el plan de Data aún no existe como evento interno; el
> frontend debe tolerarlo (sin detalle ni favorito para esos ítems). Ver
> [features/backend-recommendations-data-normalization.md](features/backend-recommendations-data-normalization.md).

## Asistente

### `POST /api/assistant/family-plan`
Plan familiar conversacional.

> **Fuente runtime:** un asistente LLM cuando `LLM_ASSISTANT_ENABLED=true`; si está
> deshabilitado o falla, **fallback local** sin IA. El proveedor LLM se elige con
> `LLM_ASSISTANT_CONTRACT`:
> - `get-question` → **chatbot Data** dockerizado (`GET {API_URL}/<pregunta>`), `source: "data-chatbot"`.
> - `post-family-plan` → **ai-service** Flask + Ollama (`POST /assistant/family-plan`), `source: "llm-local"`.
>
> El frontend **siempre** consume este Express, nunca el LLM directamente.
> Ver [integration-ai-ollama-local.md](integration-ai-ollama-local.md).

Body (todos los campos opcionales). Admite `familyProfile` anidado y/o campos sueltos (compat):

```json
{
  "message": "Plan gratis para hoy en Bilbao",
  "familyProfile": { "childrenAges": [3], "municipality": "Bilbao" },
  "rainSuitable": true,
  "budget": 30,
  "strollerFriendly": true
}
```

Validación: `message` ≤ 500 caracteres; `familyProfile` objeto; `childrenAges` array; `budget` numérico ≥ 0; `municipality` string; `strollerFriendly`/`rainSuitable` booleanos.

Respuesta con LLM (`mode: "ai"`). `source` indica el proveedor según el contrato:

```json
{
  "mode": "ai",
  "source": "data-chatbot",
  "assistantMessageMarkdown": "## 🎭 Plan recomendado\n\n...markdown...",
  "recommendations": []
}
```

> Con `LLM_ASSISTANT_CONTRACT=get-question` el `source` es `"data-chatbot"`; con
> `post-family-plan` es `"llm-local"`. En ambos casos, `recommendations` viene `[]`
> (el LLM responde Markdown). El chatbot Data puede devolver **HTTP 200 con cuerpo
> `ERROR:`** cuando falla internamente: Express lo trata como fallo y usa el fallback local.

Respuesta de fallback local (LLM deshabilitado o caído):

```json
{
  "mode": "fallback",
  "message": "El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.",
  "recommendations": [ /* hasta 3, mismo formato que /recommendations */ ]
}
```

En fallback, el contrato histórico no incluye `source`; `mode: "fallback"` identifica que Express
ha usado el recomendador local. En modo LLM, `recommendations` puede venir vacío porque el
`ai-service` devuelve principalmente Markdown en `assistantMessageMarkdown`.

## Reseñas

### `POST /api/reviews`
Crea una reseña (entra como `pending`, pendiente de moderación).

Body:

```json
{ "activityId": "act-001", "rating": 5, "comment": "Genial para ir con carrito" }
```

- `activityId` (obligatorio) · `rating` entero 1–5 (obligatorio) · `comment` opcional (≤ 1000).
- `404` si la actividad no existe · `422` si la validación falla.

Respuesta `201`:

```json
{
  "id": "f0a1...",
  "activityId": "act-001",
  "rating": 5,
  "comment": "Genial para ir con carrito",
  "status": "pending",
  "createdAt": "2026-06-01T10:00:00.000Z"
}
```

## Incidencias

### `POST /api/incidents`
Reporta una incidencia sobre una actividad (entra como `open`).

Body:

```json
{ "activityId": "act-001", "type": "datos-incorrectos", "description": "El horario no coincide" }
```

- `activityId` (obligatorio) · `type` (obligatorio) · `description` opcional (≤ 1000).
- `404` si la actividad no existe · `422` si la validación falla.

Respuesta `201`: objeto incidencia con `id`, `status: "open"` y `createdAt`.

## Favoritos

> **Fuente runtime actual:** Prisma/PostgreSQL sobre la tabla real `user_favorite_events`
> (favoritos de **events reales**). Sin auth todavía: usuario family mock fijo (id 100, creado
> por el seed). Operaciones idempotentes. Ver
> [features/backend-favorites-events-runtime.md](features/backend-favorites-events-runtime.md).
>
> **Transición de clave:** la ruta usa `:activityId` y la respuesta incluye `activityId`,
> pero es un **alias legacy temporal** de `eventId` (la clave canónica nueva). El parámetro se
> trata internamente como id de evento (entero). No retirar `activityId` hasta que el frontend migre.

### `GET /api/favorites`
Lista los **eventos** marcados como favoritos (array de eventos reales, shape de la tabla `events`).

### `POST /api/favorites/:activityId`
Añade a favoritos. `:activityId` = id de evento (entero). `404` si el evento no existe. Idempotente.

Respuesta `201`:

```json
{ "eventId": 1, "activityId": 1, "favorited": true }
```

### `DELETE /api/favorites/:activityId`
Quita de favoritos. Idempotente (no falla si no estaba: `removed: false`).

Respuesta `200`:

```json
{ "eventId": 1, "activityId": 1, "favorited": false, "removed": true }
```

---

## Resumen de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Healthcheck |
| GET | `/api/events` | Lista de eventos (filtros: municipio, territorio, categoria, tipo_evento, es_interior, es_carrito, es_cambiador, es_silla_ruedas, es_mascotas, edad, fecha_desde, fecha_hasta) |
| GET | `/api/events/:id` | Detalle de evento |
| GET | `/api/activities` | Lista de actividades aprobadas (mock previo) |
| GET | `/api/activities/:id` | Detalle de actividad |
| GET | `/api/recommendations` | Recomendaciones Data primary con fallback local (por defecto hasta 3, o `limit`) |
| POST | `/api/assistant/family-plan` | Asistente familiar LLM local opcional con fallback sin IA |
| POST | `/api/reviews` | Crear reseña |
| POST | `/api/incidents` | Reportar incidencia |
| GET | `/api/favorites` | Listar favoritos |
| POST | `/api/favorites/:activityId` | Añadir favorito |
| DELETE | `/api/favorites/:activityId` | Quitar favorito |
