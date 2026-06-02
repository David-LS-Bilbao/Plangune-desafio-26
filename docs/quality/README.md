# Calidad · DESAFIO-26

Estrategia de calidad **pragmática**, no enterprise. Objetivo: proteger demo y lógica core
sin perseguir cobertura ciega. Procedimiento operativo en [../ai/skills/SKILL_QUALITY.md](../ai/skills/SKILL_QUALITY.md).

## Estrategia 100/80/0

- **100 %** — lógica core/crítica: **Family Score**, validaciones, contrato de endpoints usados por frontend, errores importantes, roles/autorización (cuando existan).
- **80 %** — flujos importantes: búsqueda, filtros, detalle, reseñas, incidencias, favoritos, alta negocio/admin (cuando existan).
- **0 %** — infraestructura trivial: estilos puros, wrappers sin lógica, configuración simple, placeholders sin comportamiento.

No se exige 100 % de cobertura global. No se convierten Playwright, Sentry, Swagger, Husky o Sonar en obligatorios para el MVP.

## Estado actual (backend)

| Zona | Qué incluye | Estado |
|---|---|---|
| 100 core | Family Score (`/api/recommendations`): máx 3, shape `{activity,score,reasons}`, orden por score, excluye `pending` | ✅ cubierto |
| 100 contrato | `/api/activities` solo `approved`; detalle de no-aprobada → 404 | ✅ cubierto |
| 80 flujos | reviews (201/422/404), incidents (201/422/404), favorites (add/list/remove + 404) | ✅ cubierto |
| 80 flujos | error handler central (404/500/422) y health | ✅ cubierto |
| 80 flujos | asistente fallback (`/api/assistant/family-plan`) | ✅ cubierto |
| 0 | estilos, wrappers, config | sin tests (intencional) |

### Cobertura incorporada

- **Incorporada en `feature/backend`**: **29 tests (8 suites)** — health, error, activities, recommendations, reviews, incidents, favorites y assistant.
- La rama `test/backend-assistant-fallback` (`assistant.test.js` + refuerzo de explicabilidad en `recommendations.test.js`) ya está **integrada** en `feature/backend` (PR #14, commit `c167b5a`).

## Cómo ejecutar

```bash
npm run test:backend     # Vitest + Supertest (backend)
npm test                 # todos los workspaces (--if-present)
```

## Principios de los tests

- Deterministas; evitar estado compartido frágil (atención a favoritos, que comparten estado de proceso).
- No fijar valores frágiles (p. ej. scores exactos del Family Score); afirmar invariantes (orden, shape, límites).
- Cada cambio de comportamiento entra con su test mínimo (ver [../ai/skills/SKILL_TESTING_BOOTCAMP.md](../ai/skills/SKILL_TESTING_BOOTCAMP.md)).
