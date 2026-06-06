# Feature · Filtros de accesibilidad en `GET /api/events`

Rama: `feat/predev-events-filtros-accesibilidad` (hija de `test/integration-frontend-backend-20260605`, pre-dev).

## Qué añade

Soporte real para dos filtros de accesibilidad familiar en el endpoint `GET /api/events`, ya
servido desde **PostgreSQL vía Prisma**:

| Filtro | Tipo | Semántica |
|---|---|---|
| `es_silla_ruedas` | boolean | El evento es accesible con silla de ruedas. |
| `es_mascotas` | boolean | El evento admite mascotas. |

Ambas columnas ya existían en el modelo `Event` / tabla `events` (`es_silla_ruedas`,
`es_mascotas`), pero no estaban expuestas ni filtradas. Esta rama cierra ese hueco detectado en la
auditoría backend, sin tocar el resto de filtros ni ningún otro endpoint.

## Motivo

El producto (familias con bebés y niños pequeños en Euskadi) necesita poder filtrar planes por
accesibilidad con silla de ruedas y por admisión de mascotas, además de los filtros ya existentes
(municipio, territorio, categoría, tipo de evento, interior/cubierto, carrito, cambiador, edad y
rango de fechas). Así el frontend puede ofrecer el set completo de filtros MVP consumiendo eventos
reales de la base de datos.

## Contrato (sin cambios salvo estos dos filtros)

- Query params **opcionales**; igualdad booleana. Se combinan con AND con el resto de filtros.
- Valor no booleano → **422** con `{ "error": "..." }`, igual que los demás filtros booleanos.
- El shape de respuesta **no cambia**: sigue siendo el array de eventos (snake_case) ya documentado.

Fuente de verdad actualizada en el mismo cambio:
[../contracts/frontend-backend-api-contract.md](../contracts/frontend-backend-api-contract.md) y
[../api.md](../api.md).

### Mapeo UI → query (referencia frontend)

| Filtro UI | `/api/events` | `/api/recommendations` |
|---|---|---|
| Silla de ruedas | `es_silla_ruedas` | `wheelchairAccessible` |
| Mascotas | `es_mascotas` | `petsAllowed` |

> Nota: en `/api/recommendations` esos filtros ya se aceptaban como `wheelchairAccessible` /
> `petsAllowed` y se reenvían a Data. Esta rama **no** modifica `/api/recommendations`.

## Implementación (capas MVC)

- **Ruta** [`backend/src/routes/event.routes.js`](../../backend/src/routes/event.routes.js):
  validación `query('es_silla_ruedas')` y `query('es_mascotas')` con `.optional().isBoolean()`.
- **Controller** [`backend/src/controllers/event.controller.js`](../../backend/src/controllers/event.controller.js):
  parseo con el helper `parseBool` ya existente y paso al objeto `filters`.
- **Repository** [`backend/src/repositories/event.repository.js`](../../backend/src/repositories/event.repository.js):
  `buildWhere` añade `where.es_silla_ruedas` y `where.es_mascotas` cuando el filtro está definido.
- **Service** [`backend/src/services/event.service.js`](../../backend/src/services/event.service.js):
  solo documentación (`@param`); la firma y la serialización no cambian.

## Tests

`backend/src/tests/events.test.js` (repository Prisma mockeado, sin DB real, igual que el resto):

- `GET /api/events?es_silla_ruedas=true` → solo eventos con `es_silla_ruedas: true`.
- `GET /api/events?es_silla_ruedas=false` → solo eventos con `es_silla_ruedas: false`.
- `GET /api/events?es_mascotas=true` → solo eventos con `es_mascotas: true`.
- `GET /api/events?es_mascotas=false` → solo eventos con `es_mascotas: false`.
- `GET /api/events?es_silla_ruedas=quizas` → **422**.
- `GET /api/events?es_mascotas=quizas` → **422**.

## Prueba manual (curl)

Requiere backend levantado (`npm run dev:backend`) y DB local con seed.

```bash
curl "http://localhost:3000/api/events?es_silla_ruedas=true"
curl "http://localhost:3000/api/events?es_silla_ruedas=false"
curl "http://localhost:3000/api/events?es_mascotas=true"
curl "http://localhost:3000/api/events?es_mascotas=false"
curl "http://localhost:3000/api/events?es_silla_ruedas=true&es_mascotas=false"
curl -i "http://localhost:3000/api/events?es_silla_ruedas=quizas"   # → 422
```

## Fuera de alcance

No se tocan reseñas, incidencias, auth, negocio, ofertas, asistente/GUNI ni `/api/recommendations`.
No se altera el contrato salvo la incorporación de estos dos filtros.
