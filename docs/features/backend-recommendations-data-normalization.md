# Feature · Normalización de recomendaciones de Data al shape de `events`

Rama: `feat/predev-recommendations-data-normalization` (hija de `test/integration-frontend-backend-20260605`, pre-dev).

## Problema
`GET /api/recommendations` con `source: "data-api"` devolvía el `event` con el **shape crudo de la
API de Data** (`nombre`/`descripcion`/`direccion`/`precio`, `es_lluvia`, booleanos como strings
`"True"/"False"`, `edad_minima` string, sin `id`), incumpliendo el contrato F↔B que promete `event`
con shape de `events`. Detectado al integrar el bloque de recomendaciones en `/buscar`
(ver [recommender-planner.md](recommender-planner.md)).

## Solución (backend)
Normalizar el plan de Data al shape de `events` **antes** de exponerlo, sin tocar el fallback local
ni el contrato de nombres/endpoints.

- **Nuevo** [backend/src/utils/normalizeDataEvent.js](../../backend/src/utils/normalizeDataEvent.js):
  - `normalizeDataPlaneToEvent(plan)` → objeto con shape de `events` (construcción explícita: no
    arrastra claves crudas como `nombre`/`precio`/`es_lluvia`).
  - `coerceBool(value)` → boolean seguro: acepta `true/false` y `"true"/"false"/"True"/"False"`
    (evita `Boolean("False") === true`).
- **Editado** [backend/src/services/recommendation.service.js](../../backend/src/services/recommendation.service.js):
  `mapDataPlaneToRecommendation` usa el normalizador; `event` y `activity` (alias legacy) apuntan al
  **mismo** objeto normalizado; `score`/`reasons`/`source` se mantienen.

### Mapeo Data → `events`
| `events` | Data | Transformación |
|---|---|---|
| `title` | `nombre` | directo |
| `description` | `descripcion` | directo |
| `address` | `direccion` | directo |
| `price` | `precio` | directo (string; `null`→`null`) |
| `es_interior` | `es_lluvia` | `coerceBool` |
| `es_carrito`/`es_cambiador`/`es_silla_ruedas`/`es_mascotas` | idem | `coerceBool` |
| `edad_minima` | `edad_minima` | `Number` (o `null`) |
| `lat`/`lng` | `lat`/`lng` | `Number` (o `null`) |
| `municipio`/`territorio`/`categoria`/`website`/`telefono`/`email`/`lugar`/`tipo_evento`/`imagen_url`/`external_id` | idem | directo |
| `id` | — | `null` si Data no trae id interno |
| `business_id` | — | `null` |
| `fuente` | — | `"data-api"` |

> `territorio` se conserva tal cual (Data lo da en minúsculas, p. ej. `"bizkaia"`): no se transforma
> para no alterar valores usados en filtros.

## `id` puede ser `null` (documentado)
Las recomendaciones de Data son lugares externos que **no siempre existen aún como `event` interno**;
por eso `id` queda en `null`. El frontend ya contempla este caso (oculta "Ver plan"/favorito cuando
no hay `id`). Hidratar el `id` casando por `external_id` contra la tabla `events` queda como mejora
futura (no incluida en esta rama).

## Qué NO cambia
- El **fallback local** (`source: "local-fallback"`) no se toca.
- No cambian endpoints, nombres de campos del item (`event`/`activity`/`score`/`reasons`/`source`),
  ni el alias legacy. No se toca frontend, GUNI ni DeepSeek.

## Tests
- [normalizeDataEvent.test.js](../../backend/src/tests/normalizeDataEvent.test.js) (14): `coerceBool`
  y el mapeo completo (alias de campos, booleanos string→bool, `edad_minima` número, `id` null,
  no arrastra claves crudas).
- [recommendations.test.js](../../backend/src/tests/recommendations.test.js): nuevo caso de Data con
  shape crudo → `event.title` presente, `event.nombre` ausente, booleanos reales, `edad_minima`
  número, `id` null, `activity === event`, `source/score/reasons` intactos.
- `npm run test:backend` → **115/115**.

## Verificación manual (curl) — requiere reiniciar el backend para tomar el cambio
Con Data habilitada (`DATA_RECOMMENDER_ENABLED=true`) y el backend reiniciado:
```bash
curl "http://localhost:3000/api/recommendations?municipality=Bilbao&limit=3"
# Esperado en cada item:
#   .event.title presente (no .event.nombre)
#   .event.es_interior / .event.es_silla_ruedas / .event.es_mascotas → booleanos true/false
#   .event.edad_minima → número
#   .event.id → null (si el plan de Data no existe como event interno)
#   .activity == .event ; .source == "data-api"
```

## Riesgos / pendientes
- **Hidratación de `id`** por `external_id` (para habilitar detalle/favorito de planes de Data) queda
  pendiente; requiere consistencia de `external_id` entre Data y `events`.
- `/api/recommendations` sigue **sin validación** de query (no `422`): gap conocido, fuera de alcance.
- El proceso backend en ejecución debe **reiniciarse** para servir el código nuevo.
