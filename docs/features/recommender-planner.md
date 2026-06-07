# Feature · Recomendaciones familiares explicables en el planificador

Rama: `feat/predev-recommender-planner` (hija de `test/integration-frontend-backend-20260605`, pre-dev).

Conecta el endpoint real de recomendaciones al frontend y muestra **recomendaciones familiares
explicables** dentro del flujo de búsqueda, reutilizando la capa de API ya creada en
[family-planner-api.md](family-planner-api.md). No toca GUNI, DeepSeek ni el backend.

## Endpoint usado
`GET /api/recommendations` (Express; fachada única). Express decide internamente Data API o el
recomendador local con fallback; el frontend **nunca** llama a Data/Flask/Ollama/DeepSeek.

Query params enviados (camelCase, según contrato): `municipality`, `childrenAges` (CSV),
`strollerFriendly`, `changingTable`, `rainSuitable`, `wheelchairAccessible`, `petsAllowed`,
`budget`, `limit`. El backend responde un array de items:
`{ event, activity (alias legacy), score, reasons[], source }`.

## Pantalla afectada
- **`/buscar`** ([PlansSearch.jsx](../../frontend/src/pages/PlansSearch.jsx)): se añade un bloque
  **"Recomendado para tu familia"** encima de los resultados. Usa los **mismos filtros** que ya
  introduce el usuario como contexto de recomendación (ver mapeo abajo). No se modificó `/planes`.

## Arquitectura añadida
- `frontend/src/services/recommendationsApi.js` — `fetchRecommendations(context)`; normaliza
  params (omite vacíos, serializa `childrenAges` array→`"2,5"`, conserva `budget: 0`).
- `frontend/src/mappers/recommendationMapper.js` — `recommendationToCard` / `recommendationsToCards`:
  resuelven `event` (o `activity` legacy) reutilizando `eventToPlan`, y añaden `score`, `reasons` y
  una **etiqueta amable** (`scoreLabel`). El `source` se guarda como metadato interno (`recSource`)
  y **no se muestra en crudo**.
- `frontend/src/components/recommendations/RecommendedPlans.jsx` (+ `.css`) — bloque autónomo con
  loading/error/empty propios; muestra por tarjeta: etiqueta amable, título, municipio/territorio,
  razones explicables, botón favorito (reutiliza `FavoritesContext`) y CTA "Ver plan" → `/planes/:id`.

### Mapeo filtros UI (/buscar) → contexto de recomendación
| Filtro UI | Param `/api/recommendations` |
|---|---|
| Municipio (texto) | `municipality` |
| Edad (pills) | `childrenAges` (CSV de edades de referencia) |
| Carrito | `strollerFriendly` |
| Cambiador | `changingTable` |
| Silla de ruedas | `wheelchairAccessible` |
| Mascota | `petsAllowed` |
| Interior | `rainSuitable` |
| Gratis | `budget = 0` |
| (siempre) | `limit = 3` |

> "Tranquilo" y "Territorio" no tienen equivalente en el contrato de recomendaciones: se omiten
> (no rompen). El `score` se traduce a etiqueta amable ("Ideal para tu familia" / "Muy buen plan" /
> "Buen plan"); no se enseña el número ni el `source`.

## Fallback visual
- **Carga:** spinner discreto dentro del bloque.
- **Error** (`/api/recommendations` falla): el bloque muestra un aviso breve ("No hemos podido
  cargar recomendaciones…") y **nada más**; el listado de eventos de `/buscar` sigue funcionando
  (estados independientes).
- **Vacío:** mensaje amable invitando a ajustar filtros.
- La degradación de Data→local (`source`) es transparente para el usuario: la UI se ve igual.

## ⚠️ Divergencia de contrato detectada (backend) — reportada, NO resuelta en esta rama
Al verificar en vivo con **Data API habilitada** (`source: "data-api"`), el `event` **no** viene
normalizado al shape de `events` que promete el contrato. Observado:

| Contrato (`events`) | Lo que devuelve Data |
|---|---|
| `title` | `nombre` |
| `description` | `descripcion` |
| `price` | `precio` |
| `address` | `direccion` |
| `es_interior` | `es_lluvia` |
| `es_*` booleanos | strings `"True"` / `"False"` |
| `edad_minima` número | string `"0"` |
| `id` (entero) | **ausente** |

Impacto: sin normalizar, las tarjetas saldrían **sin título** y los booleanos mal interpretados
(`Boolean("False") === true`). Además, **sin `id`** no hay detalle interno (`/api/events/:id`) ni
favorito posible (esos planes de Data no son eventos de nuestra DB).

**Decisión (según reglas):** no se toca el backend. El **mapper del frontend normaliza ambos shapes**
y el componente **oculta "Ver plan" y el favorito** cuando falta `id`. **Acción recomendada para el
backend (otra rama, con aprobación):** que Express normalice las recomendaciones de Data al shape de
`events` (incluyendo un `id` interno cuando el plan exista en la DB) antes de responder, como dice el
contrato. También sigue pendiente la validación de query (sin `422`).

## Cómo probarlo (backend vivo + DB con seed)
```bash
# Backend en :3000 y frontend (ver nota de CORS en docs de integración).
# En el navegador, /buscar:
#  - aparece el bloque "Recomendado para tu familia" con razones.
#  - al cambiar filtros (edad, municipio, servicios) las recomendaciones se actualizan.
# Comprobación directa del endpoint:
curl "http://localhost:3000/api/recommendations?childrenAges=2,5&municipality=Bilbao&strollerFriendly=true&limit=3"
```
Verificación rápida: cada item trae `event`, `score`, `reasons[]` y `source`; el frontend muestra
las `reasons` y una etiqueta amable, nunca el `source` en crudo.

## Tests
- `recommendationMapper.test.js` — event/activity (alias), score→etiqueta, reasons, source interno, null-safety.
- `recommendationsApi.test.js` — GET correcto, serialización de params, `[]` defensivo.
- `RecommendedPlans.test.jsx` — smoke: pinta recomendaciones + razones + CTA; el fallo no rompe (aviso).
- `npm run test:frontend` → **36/36**. `npm run build --workspace frontend` → OK.

## Riesgos / pendientes
- Sin auth: el contexto familiar viaja por query; no hay perfil persistido.
- La escala de `score` puede variar entre Data (`data-api`) y el recomendador local; por eso se usa
  etiqueta amable en lugar del número.
- `/api/recommendations` **no valida** la query (no devuelve 422); params mal formados se ignoran
  (gap de backend ya conocido en la auditoría, **no** se aborda en esta rama frontend).
- Requiere backend vivo + DB con seed; si cae, el bloque degrada sin romper la búsqueda.
