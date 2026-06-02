# Informe de cierre de calidad · Backend MVP · DESAFIO-26

- Fecha: 2026-06-02
- Rama backend de referencia: `feature/backend`
- Alcance: backend MVP (runtime mock en memoria). **No** incluye frontend.

> **Este informe NO propone merge a `dev`.** `feature/backend` no se integra en `dev`
> hasta que frontend y backend estén terminados e integrados entre sí.

## Estado del backend MVP

- API REST bajo `/api` (Express ESM, MVC: routes → controllers → services).
- Runtime con **datos mock en memoria**; PostgreSQL/Prisma **preparados pero no runtime**
  (modelos MVP + seed listos, services aún sobre mock). Ver [ADR-0001](../adr/0001-prisma-preparado-no-runtime.md).
- Arranca **sin** dependencia de DB/Python/Ollama. Error handler central con forma `{ "error": "<mensaje>" }`.
- Family Score reglado, determinista y explicable (`score` + `reasons`). Ver [ADR-0002](../adr/0002-family-score-reglado-explicable.md).

## Endpoints disponibles

| Método | Ruta | Notas |
|---|---|---|
| GET | `/api/health` | Healthcheck, sin DB |
| GET | `/api/activities` | Solo `approved` |
| GET | `/api/activities/:id` | 404 si no existe o no aprobada |
| GET | `/api/recommendations` | Hasta 3 planes con Family Score (`{activity,score,reasons}`) |
| POST | `/api/assistant/family-plan` | Fallback sin IA (`mode:"fallback"`) |
| POST | `/api/reviews` | Entra `pending`; 422/404 |
| POST | `/api/incidents` | Entra `open`; 422/404 |
| GET/POST/DELETE | `/api/favorites` | Sin auth (usuario mock) |

Contrato detallado en [../api.md](../api.md).

## Tests actuales

### Incorporados en `feature/backend` (cobertura real hoy)

**24 tests · 7 suites · verdes.**

| Suite | Tests | Zona |
|---|---|---|
| `health.test.js` | 1 | 80 |
| `error.test.js` | 4 | 80 (404/500/422) |
| `activities.test.js` | 5 | 100 contrato (solo `approved`, 404 de no-aprobada) |
| `recommendations.test.js` | 5 | 100 core (Family Score: máx 3, shape, orden, sin `pending`) |
| `reviews.test.js` | 3 | 80 (201/422/404) |
| `incidents.test.js` | 3 | 80 (201/422/404) |
| `favorites.test.js` | 3 | 80 (add/list/remove + 404) |

### Propuestos / pendientes de PR (NO contados como cobertura incorporada)

En la rama `test/backend-assistant-fallback` (commit `894b06b`), **aún no integrada** en `feature/backend`:

- `assistant.test.js` (**+4**): 200 + `mode:"fallback"`; `recommendations` array ≤3 con shape; body vacío → 200; `message`>500 → 422.
- `recommendations.test.js` (**+1**): explicabilidad no frágil (top result con `reasons.length > 0`).

> Una vez integrada esa rama (PR `test/backend-assistant-fallback → feature/backend`), la
> cobertura incorporada pasará a **29 tests · 8 suites**. Hasta entonces, se cuentan como pendientes.

Estrategia y criterios en [README.md](README.md) (100/80/0).

## Deuda registrada

| Tema | Estado | Referencia |
|---|---|---|
| CORS permisivo por defecto (`origin: CLIENT_URL || true`) | Documentado, **no tocado** | [../security.md](../security.md) |
| Auth + roles (admin/negocio) en backend | No implementado (fuera de MVP) | [../security.md](../security.md) |
| Rate limiting en `POST` (reviews/incidents) | No implementado | [../security.md](../security.md) |
| Migración services mock → Prisma runtime | Pendiente, manteniendo contrato | [ADR-0001](../adr/0001-prisma-preparado-no-runtime.md) |
| Reconciliación modelo Prisma ↔ propuesta SQL de Data | Pendiente (Full Stack + Data + Ciber) | [ADR-0003](../adr/0003-divergencia-sql-data-vs-prisma.md) |

## Riesgos P0/P1/P2

- **P0 (bloqueante):** ninguno. El backend arranca, el contrato `/api` es estable y los tests pasan.
- **P1 (antes de integrar con frontend):**
  - Divergencia de datos frontend↔backend (IDs/shape de `frontend/src/mocks/data.js` no alineados, sin `VITE_API_URL`). Documentado en [../integration-frontend-backend.md](../integration-frontend-backend.md).
  - Deuda CORS: definir `CLIENT_URL` antes de exponer en un entorno compartido.
- **P2 (futuro):** auth/roles, rate limiting, migración a Prisma, comentario aclaratorio en `config/prisma.js`.

## Qué falta antes de integrar con frontend

1. Integrar la rama de tests (`assistant.test.js` + refuerzo) en `feature/backend`.
2. Definir `VITE_API_URL` y un cliente axios central en frontend; alinear el shape de los mocks del frontend con `docs/api.md` (o mapear en la capa de servicios).
3. Conectar pantallas críticas en orden: `/planes` y `/planes/:id` (lectura) → recomendaciones → favoritos/reseñas/incidencias (escritura).
4. Decidir `CLIENT_URL` para CORS en el entorno de integración.
5. (Cuando aplique) auth/roles para proteger admin/negocio en backend.

## Nota final

Este es un **informe de calidad**, no un PR. **No se propone, prepara ni sugiere merge a `dev`.**
Las ramas de este ciclo (`docs/backend-mvp-quality`, `test/backend-assistant-fallback`) vuelven,
en su momento y a decisión humana, a `feature/backend`.
