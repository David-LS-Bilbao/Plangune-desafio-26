# Propuesta de modelo de datos · Data Science · DESAFIO-26

Esta carpeta recoge la **propuesta de esquema SQL** aportada por el equipo de **Data Science**.

> ⚠️ **Estado: PROPUESTA documental, NO ejecutable todavía.**
> [`BBDD.sql`](BBDD.sql) **no** es la fuente de verdad actual del backend ni debe ejecutarse,
> migrarse ni usarse para generar Prisma. Está pendiente de **reconciliar** con el backend MVP.

## Qué es `BBDD.sql`

- Esquema PostgreSQL (v5) "App Ocio Familiar" propuesto por Data Science.
- Modela usuarios, familias, hijos, cuentas de comercio, comercios, categorías, eventos,
  características, **embeddings vectoriales (`pgvector`)**, historial familiar, favoritos y ratings.
- Requiere extensiones `vector` (pgvector) y `pgcrypto`.

## Fuente de verdad ACTUAL del backend

El backend MVP **no** usa este SQL. Hoy la verdad operativa es:

| Capa | Fuente de verdad | Ubicación |
| --- | --- | --- |
| Contrato API | Endpoints REST documentados | [../api.md](../api.md) |
| Lógica MVP | Services con datos **mock en memoria** | `backend/src/services/`, `backend/src/seed/mockActivities.js` |
| Modelo Prisma MVP | `Activity`, `Review`, `Incident`, `Favorite` | `backend/prisma/schema.prisma` |

Endpoints vigentes: `/api/activities`, `/api/recommendations`, `/api/reviews`,
`/api/incidents`, `/api/favorites`, `/api/assistant/family-plan`.

## Divergencia pendiente (SQL de Data ↔ Prisma MVP ↔ API actual)

| Concepto | `BBDD.sql` (Data) | Prisma MVP / API actual |
| --- | --- | --- |
| Idioma | Español (`usuarios`, `familias`, `comercios`, `eventos`) | Inglés (`Activity`, `Review`, `Incident`, `Favorite`) |
| Entidad central | `eventos` (ligados a `comercios`) | `Activity` (sin comercio) · API `/api/activities` |
| Valoraciones | `ratings` sobre **comercios** (1 por user/comercio) + `historial_familia.valoracion` sobre eventos | `Review` sobre **actividades**, estado `pending` |
| Favoritos | `favoritos` por **familia + evento** | `Favorite` por **userId mock + activityId** |
| Usuarios/roles | `users`, `familias`, `familia_miembros`, `cuentas_comercio` | Sin auth todavía (un único usuario mock) |
| Incidencias | No existe equivalente | `Incident` (API `/api/incidents`) |
| Búsqueda semántica | `evento_embeddings VECTOR(768)` + `pgvector` (IVFFlat) | No contemplado en el MVP |

## Riesgos detectados

1. **Idioma divergente**: español (SQL) vs inglés (Prisma/API). Romperá el mapeo si no se decide una convención única.
2. **`eventos` vs `activities`**: no son 1:1. Los eventos tienen fecha/capacidad/comercio; las actividades del MVP son atemporales.
3. **`ratings` sobre comercios vs `reviews` sobre actividades**: distinta entidad objetivo y distinta cardinalidad (1 rating/user/comercio vs N reviews/actividad).
4. **Favoritos por familia/evento vs por userId/activityId mock**: el SQL comparte favoritos a nivel familia; el MVP los asocia a un usuario mock.
5. **🔒 Privacidad de datos de menores**: la tabla `hijos` almacena `nombre TEXT NOT NULL` (nombre del menor), aunque solo guarde `rango_edad`. **Almacenar el nombre de un menor es un dato sensible** y debe revisarse con Ciberseguridad antes de aceptar el modelo. El backend MVP actual **no** guarda ningún dato de menores.
6. **`pgvector`**: introduce una extensión y un índice IVFFlat que requieren decisión técnica (infraestructura, generación de embeddings con Ollama/`nomic-embed-text`, mantenimiento del índice). No está en el alcance del MVP.

## Decisión actual

- **Mantener `BBDD.sql` como propuesta documental** en `docs/data/`.
- **No modificar el backend** (services, controllers, routes, Prisma, endpoints) para adaptarlo a este SQL.
- Cualquier alineación se decide de forma **conjunta entre Full Stack + Data Science + Ciberseguridad**.

## Próximos pasos recomendados

1. **Reunión corta con Data Science** para decidir la **fuente de verdad** del modelo de datos.
2. **Mapear entidades** SQL ↔ Prisma/API (tabla de equivalencias `eventos↔Activity`, `ratings↔Review`, `favoritos↔Favorite`, etc.).
3. Decidir si se **adapta Prisma** (p. ej. con `@@map`/`@map` para nombres en español) o si se **mantiene el modelo MVP** en inglés y Data se adapta.
4. **Revisar con Ciberseguridad** la privacidad de los datos de menores (campo `hijos.nombre`) antes de aceptar el esquema.
5. Evaluar por separado la introducción de **`pgvector`** (coste/beneficio, infra, embeddings).
