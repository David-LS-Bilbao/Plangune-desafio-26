# Contrato Frontend ↔ Backend · DESAFIO-26

**Fuente de verdad** del contrato entre `feature/frontend` (React + Vite) y `feature/backend`
(Express + Prisma/PostgreSQL). Si otro documento contradice a este, **manda este**.

> Cualquier tarea frontend/backend que **consuma o modifique API** debe consultar este documento
> **antes de tocar código**. Para el detalle de cada endpoint, ver [../api.md](../api.md) (índice).
> Para el flujo de integración, ver [../integration/frontend-backend.md](../integration/frontend-backend.md).

---

## Regla principal

1. El frontend consume **exclusivamente** la API Express bajo `/api`.
2. El frontend **nunca** llama directamente a **Data API (Flask)**, **Python**, **Ollama**,
   el **chatbot Data** ni ningún otro servicio interno. Express es la **fachada única**:
   normaliza datos y gestiona los fallbacks.
3. La UI **no debe romperse** cuando una respuesta llega por fallback
   (`source: "local-fallback"` o `mode: "fallback"`).

---

## Base URL

| Entorno | Base URL | Cómo se configura |
|---|---|---|
| Local | `http://localhost:3000/api` | `VITE_API_URL` en el frontend |
| Docker / VPS | la del gateway Express publicado | `VITE_API_URL` (build) |

> En Docker/VPS **solo se publica Express**. Los servicios internos (Postgres `5434`,
> Data API/Flask, Ollama `11434`) **no son accesibles desde el navegador**. Nunca hardcodear URLs:
> usar siempre `import.meta.env.VITE_API_URL`.

**Formato:** JSON. **Errores:** forma uniforme `{ "error": "<mensaje>" }`.
**Códigos:** `200` OK · `201` creado · `404` no encontrado · `422` validación.

---

## Endpoints MVP

| Método | Endpoint | Descripción | `source` posible |
|---|---|---|---|
| GET | `/api/health` | Healthcheck (no requiere DB) | — |
| GET | `/api/events` | Lista de eventos (array) con filtros | — |
| GET | `/api/events/:id` | Detalle de evento | — |
| GET | `/api/recommendations` | Recomendaciones (Data primary + fallback local) | `data-api` \| `local-fallback` |
| GET | `/api/favorites` | Lista de eventos favoritos | — |
| POST | `/api/favorites/:activityId` | Añadir favorito (idempotente) | — |
| DELETE | `/api/favorites/:activityId` | Quitar favorito (idempotente) | — |
| POST | `/api/assistant/family-plan` | Asistente familiar (LLM + fallback local) | IA: `data-chatbot` \| `llm-local` · fallback: sin `source` |

---

## GET /api/health

```json
{ "status": "ok", "service": "DESAFIO-26 API" }
```

---

## GET /api/events

Devuelve un **array** de eventos (shape real de la tabla `events`, **snake_case**).

**Query params (todos opcionales, igualdad salvo nota):**

| Filtro | Tipo | Ejemplo | Semántica |
|---|---|---|---|
| `municipio` | string | `Bilbao` | igualdad (case-insensitive) |
| `territorio` | string | `Bizkaia` | igualdad |
| `categoria` | string | `museo` | igualdad |
| `tipo_evento` | string | `taller` | igualdad |
| `es_interior` | boolean | `true` | plan a cubierto / apto si llueve |
| `es_carrito` | boolean | `true` | accesible con carrito |
| `es_cambiador` | boolean | `true` | dispone de cambiador |
| `edad` | entero | `2` | apto si `edad_minima <= edad` |
| `fecha_desde` | ISO 8601 | `2026-07-01` | `fecha_inicio >= fecha_desde` |
| `fecha_hasta` | ISO 8601 | `2026-07-31` | `fecha_inicio <= fecha_hasta` |

Filtros mal formados (boolean inválido, `edad` no numérica, fecha no ISO) → **422**.

**Ejemplo request:** `GET /api/events?municipio=Bilbao&es_carrito=true&edad=2`

**Ejemplo response (un evento):**

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

### GET /api/events/:id

Detalle por `id` (entero). `404` si no existe. Mismo shape que arriba.

---

## GET /api/recommendations

Devuelve **como máximo 3 planes por defecto**, o el número indicado por `limit`.
La **API de Data (Flask)** es el recomendador **principal** cuando está habilitada; si falla o está
deshabilitada, se usa el **recomendador local** (Family Score sobre `events`) como **fallback**.

**Query params (contexto opcional):**

| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `childrenAges` | lista | `2,5` | Edades de los peques (separadas por comas) |
| `municipality` | string | `Bilbao` | Municipio de referencia (cercanía) |
| `strollerFriendly` | boolean | `true` | Se necesita acceso con carrito |
| `changingTable` | boolean | `true` | Se necesita cambiador |
| `rainSuitable` | boolean | `true` | Llueve / plan a cubierto |
| `budget` | número | `30` | Coste familiar máximo (€) — solo recomendador local |
| `limit` | número | `5` | Máximo de recomendaciones (por defecto 3) |

> Filtros adicionales reenviados a Data: `wheelchairAccessible`, `petsAllowed`, `includeKulturklik`.
> Nota de naming: `municipality`/`strollerFriendly` (camelCase) son query públicas; el evento
> devuelto usa snake_case (`municipio`, `es_carrito`). Express hace el mapeo.

**Ejemplo request:** `GET /api/recommendations?childrenAges=2,5&municipality=Bilbao&rainSuitable=true&limit=3`

**Ejemplo response (array):**

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

**Campos de cada item:**

| Campo | Descripción |
|---|---|
| `event` | **Clave principal nueva**: shape real de `events` (snake_case). |
| `activity` | **Alias legacy temporal** del mismo objeto. **No retirar** sin plan ni sin avisar al frontend. |
| `score` | Puntuación de recomendación (número). |
| `reasons` | Array de strings explicativos (mostrables al usuario). |
| `source` | `"data-api"` (recomendación de Data) o `"local-fallback"` (recomendador local). |

---

## Favoritos

> **Ruta pública: `:activityId`** (alias legacy). La respuesta incluye **`eventId`** (clave
> canónica interna) **y** `activityId`. El parámetro se trata internamente como id de evento (entero).
> **No retirar** `activityId` hasta que el frontend migre. Sin auth: usuario family mock fijo.

### GET /api/favorites

Lista los **eventos** marcados como favoritos (array de eventos reales, shape de `events`).

### POST /api/favorites/:activityId

Añade a favoritos. `:activityId` = id de evento (entero). `404` si el evento no existe. Idempotente.

```json
{ "eventId": 1, "activityId": 1, "favorited": true }
```

### DELETE /api/favorites/:activityId

Quita de favoritos. Idempotente (no falla si no estaba: `removed: false`).

```json
{ "eventId": 1, "activityId": 1, "favorited": false, "removed": true }
```

---

## POST /api/assistant/family-plan

Plan familiar conversacional. Un asistente LLM cuando está habilitado; si falla o está
deshabilitado, **fallback local** sin IA. El frontend **siempre** consume este Express, nunca el LLM.

**Entrada (todos los campos opcionales):**

```json
{
  "message": "Plan gratis para hoy en Bilbao",
  "familyProfile": { "childrenAges": [3], "municipality": "Bilbao" }
}
```

- `message` ≤ 500 caracteres.
- `familyProfile` (objeto): `childrenAges` (array), `municipality` (string),
  `strollerFriendly`/`rainSuitable` (boolean), `budget` (número ≥ 0).
- Compat: también acepta esos campos sueltos en la raíz del body (tienen prioridad).

**Salida modo IA (`mode: "ai"`):**

```json
{
  "mode": "ai",
  "source": "data-chatbot",
  "assistantMessageMarkdown": "## 🎭 Plan recomendado\n\n...markdown...",
  "recommendations": []
}
```

- `source`: `"data-chatbot"` (chatbot Data dockerizado) o `"llm-local"` (ai-service Flask + Ollama).
- El texto del asistente llega en **`assistantMessageMarkdown`** (Markdown).
  **No existe un campo `assistantMessage` plano** — no asumirlo.
- En modo IA, `recommendations` viene normalmente **`[]`** (el LLM responde en Markdown).

**Salida fallback local (LLM deshabilitado o caído):**

```json
{
  "mode": "fallback",
  "message": "El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.",
  "recommendations": [ "...hasta 3, mismo formato que /api/recommendations..." ]
}
```

- El fallback usa **`message`** (texto plano), **no** `assistantMessageMarkdown`.
- El fallback **no incluye `source`**: se identifica por `mode: "fallback"`.

> **Regla de UI:** distinguir siempre por `mode`. En `"ai"` renderizar `assistantMessageMarkdown`;
> en `"fallback"` mostrar `message` + `recommendations`. No asumir que la IA está disponible.

---

## `source` y `mode` son metadatos técnicos

- `source` (`data-api` / `local-fallback` / `data-chatbot` / `llm-local`) y `mode` (`ai` / `fallback`)
  describen **de dónde** viene la respuesta.
- **No deben mostrarse en crudo al usuario.** Úsalos solo para lógica interna (telemetría,
  decidir cómo renderizar, mensajes de degradación amables).
- La UI debe verse y funcionar igual de bien con datos de Data o del fallback local.

---

## Campos mínimos para el frontend

**Cards (lista de planes)** — del objeto `event`:
`id`, `title`, `municipio`, `categoria`, `price`, `imagen_url`, `edad_minima`,
`es_interior`, `es_carrito`, `es_cambiador`.

**Detalle** — los de card más:
`description`, `territorio`, `address`, `lat`, `lng`, `telefono`, `website`,
`fecha_inicio`, `fecha_fin`, `lugar`, `tipo_evento`.

**Filtros (mapeo UI → query):**

| Filtro UI | `/api/events` | `/api/recommendations` |
|---|---|---|
| Edad del peque | `edad` | `childrenAges` |
| Municipio | `municipio` | `municipality` |
| Carrito | `es_carrito` | `strollerFriendly` |
| Cambiador | `es_cambiador` | `changingTable` |
| Apto si llueve | `es_interior` | `rainSuitable` |
| Presupuesto | — | `budget` |

---

## Qué NO debe hacer el frontend

- ❌ Llamar a Data API, Flask, Python, Ollama o el chatbot Data directamente.
- ❌ Hardcodear URLs de servicios internos o puertos (`5434`, `11434`, etc.).
- ❌ Mostrar `source` / `mode` crudos al usuario.
- ❌ Asumir que la IA está disponible (siempre manejar `mode: "fallback"`).
- ❌ Depender de `recommendations` poblado en modo `ai` (puede venir `[]`).
- ❌ Eliminar el manejo de los alias `activity` (en recomendaciones) y `activityId` (en favoritos).
- ❌ Esperar `assistantMessage` plano: el modo IA usa `assistantMessageMarkdown`.

---

## Errores y fallback esperados

| Situación | Respuesta |
|---|---|
| Recurso no existe (evento/favorito) | `404` `{ "error": "..." }` |
| Validación de filtros/body | `422` `{ "error": "..." }` |
| Data API caída | `/api/recommendations` responde con `source: "local-fallback"` |
| LLM caído/deshabilitado | `/api/assistant/family-plan` responde `mode: "fallback"` |
| Chatbot Data devuelve `ERROR:` (HTTP 200) | Express lo trata como fallo → fallback local |

---

## Cambios de contrato

Cambiar shape de respuesta, renombrar endpoints o retirar un alias (`event`/`activity`,
`eventId`/`activityId`) **requiere**: actualizar este contrato y [../api.md](../api.md),
avisar al equipo frontend, y añadir/actualizar tests o mocks. Ver
[../ai/skills/SKILL_FRONTEND_BACKEND_CONTRACT.md](../ai/skills/SKILL_FRONTEND_BACKEND_CONTRACT.md).
