# Instrucciones para Claude/Codex — Integración Data Recommender Primary

## Objetivo
Conectar el backend Express de DESAFIO-26 con la API Flask del equipo Data para que Data sea la fuente principal de recomendaciones y el recomendador local Prisma/PostgreSQL quede como fallback.

## Decisión final
- Data API `/planes` = recomendador principal.
- Backend Express = única API pública para frontend.
- Recomendador local Prisma = fallback técnico.
- Frontend no debe llamar directamente a Flask.

## Rama
Crear desde `feature/backend` limpia:

```bash
git switch feature/backend
git pull origin feature/backend
git switch -c feat/backend-data-recommender-primary
```

## Contrato Data conocido
Endpoints:
- `GET /health`
- `GET /planes`
- `GET /planes/<external_id>`

Query params de `/planes`:
- `ubicacion`
- `edad_max`
- `lluvia`
- `carrito`
- `cambiador`
- `silla_ruedas`
- `mascotas`
- `kulturklik`
- `limite`

## Variables de entorno
- `DATA_RECOMMENDER_ENABLED=true`
- `DATA_API_URL=http://localhost:5000`
- `DATA_API_TIMEOUT_MS=2000`

## Mapeo Express -> Data
- `municipality` -> `ubicacion`
- `childrenAges` -> `edad_max = min(childrenAges)`
- `rainSuitable` -> `lluvia`
- `strollerFriendly` -> `carrito`
- `changingTable` -> `cambiador`
- `wheelchairAccessible` -> `silla_ruedas`
- `petsAllowed` -> `mascotas`
- `limit` -> `limite`
- `includeKulturklik` -> `kulturklik`

## Respuesta compatible esperada
Cada recomendación debe mantener:

```json
{
  "event": {},
  "activity": {},
  "score": 3,
  "reasons": ["Recomendado por el servicio Data"],
  "source": "data-api"
}
```

Si Data falla, usar fallback local:

```json
{
  "event": {},
  "activity": {},
  "score": 100,
  "reasons": ["Fallback local"],
  "source": "local-fallback"
}
```

## Archivos esperados
- `backend/src/clients/dataRecommender.client.js`
- `backend/src/services/recommendation.service.js`
- `backend/src/tests/recommendations.test.js`
- `backend/src/tests/assistant.test.js` si se ve afectado
- `docs/features/backend-data-recommender-primary.md`
- `docs/api.md`
- `.env.example` si existe

## Implementación
1. Crear cliente HTTP con `fetch` nativo de Node 20.
2. Usar `AbortController` para timeout.
3. No añadir Axios salvo justificación fuerte.
4. Conservar la lógica local actual como `getLocalRecommendations(context)`.
5. `getRecommendations(context)` debe hacer:
   - si Data está habilitado: intentar Data API;
   - si responde bien: mapear a shape compatible;
   - si falla: fallback local.
6. Mapper Data -> recommendation item compatible.
7. Mantener alias legacy `activity`.

## Tests mínimos
- Data disabled -> fallback local.
- Data OK -> `source: data-api`.
- Data timeout -> fallback local.
- Data 503 -> fallback local.
- Respuesta inválida -> fallback local.
- Mantiene `event` y `activity`.
- Tests sin Flask real ni DB real: mockear client/repository.

## Validación
```bash
npm run prisma:generate --workspace backend
npm run test:backend
```

## No tocar
- `schema.prisma`
- migraciones
- `seed.js`
- Docker/compose en esta rama
- frontend
- auth
- businesses/offers
- favorites
- events runtime

## Documentación obligatoria
Crear `docs/features/backend-data-recommender-primary.md` con:
- Data como fuente principal.
- Fallback local.
- Variables de entorno.
- Mapeo de filtros.
- Shape de respuesta.
- Limitaciones.
- Cómo probar con Data encendido/apagado.
- Pendiente: Docker data-api.

Actualizar `docs/api.md` explicando que `/api/recommendations` usa Data API principal + fallback local y que cada item incluye `source`.

## Restricciones Git
- No hacer commit.
- No hacer push.
- No usar `git add .`.
- Antes de editar, mostrar rama actual, working tree, archivos a tocar, plan, riesgos y comandos.
