# API · DESAFIO-26 (MVP)

Documentación mínima de los endpoints de la rama `feat/backend-api-contract`.

> **Estado MVP**: los datos son **mock en memoria** (sin PostgreSQL/Prisma todavía).
> No hay auth. Las reseñas, incidencias y favoritos **se reinician al reiniciar el proceso**.
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

## Actividades

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

## Recomendaciones (Family Score)

### `GET /api/recommendations`
Devuelve **como máximo 3** planes ordenados por Family Score (scoring reglado y explicable).

Contexto opcional por **query string**:

| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `childrenAges` | lista | `2,5` | Edades de los peques (separadas por comas) |
| `strollerFriendly` | boolean | `true` | Se necesita acceso con carrito |
| `rainSuitable` | boolean | `true` | Llueve / se busca plan a cubierto |
| `budget` | número | `30` | Coste familiar máximo (€) |
| `municipality` | string | `Bilbao` | Municipio de referencia (cercanía) |

Respuesta (array de recomendaciones con explicación):

```json
[
  {
    "activity": { "id": "act-003", "title": "Parque de Doña Casilda" },
    "score": 75,
    "reasons": [
      "Apto para la edad de tus peques (0–10 años)",
      "Accesible con carrito",
      "Cerca de Bilbao"
    ]
  }
]
```

## Asistente

### `POST /api/assistant/family-plan`
Plan familiar. De momento **no usa IA** (ni Python ni Ollama): devuelve un fallback controlado reutilizando el recomendador.

Body (todos los campos opcionales):

```json
{
  "message": "Plan a cubierto para un peque de 3 años",
  "childrenAges": [3],
  "rainSuitable": true,
  "municipality": "Bilbao",
  "budget": 30,
  "strollerFriendly": true
}
```

Validación: `message` ≤ 500 caracteres; `childrenAges` array; `budget` numérico ≥ 0; `municipality` string; `strollerFriendly`/`rainSuitable` booleanos.

Respuesta:

```json
{
  "mode": "fallback",
  "message": "El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.",
  "recommendations": [ /* hasta 3, mismo formato que /recommendations */ ]
}
```

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

> Sin auth: un único usuario mock. Operaciones idempotentes.

### `GET /api/favorites`
Lista las actividades marcadas como favoritas (array de actividades).

### `POST /api/favorites/:activityId`
Añade a favoritos. `404` si la actividad no existe.

Respuesta `201`:

```json
{ "activityId": "act-001", "favorited": true }
```

### `DELETE /api/favorites/:activityId`
Quita de favoritos.

Respuesta `200`:

```json
{ "activityId": "act-001", "favorited": false, "removed": true }
```

---

## Resumen de endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Healthcheck |
| GET | `/api/activities` | Lista de actividades aprobadas |
| GET | `/api/activities/:id` | Detalle de actividad |
| GET | `/api/recommendations` | Hasta 3 planes con Family Score |
| POST | `/api/assistant/family-plan` | Plan familiar (fallback sin IA) |
| POST | `/api/reviews` | Crear reseña |
| POST | `/api/incidents` | Reportar incidencia |
| GET | `/api/favorites` | Listar favoritos |
| POST | `/api/favorites/:activityId` | Añadir favorito |
| DELETE | `/api/favorites/:activityId` | Quitar favorito |
