# ADR-0004 · Fuente de verdad del schema real (Real Schema Source of Truth)

- Fecha: 2026-06-02
- Estado: **aceptada** · supera [ADR-0003](0003-divergencia-sql-data-vs-prisma.md)

## Contexto

La rama `feature/backend` recibió la base de datos real del proyecto como
`docs/data/schema-real/init.sql`. Simultáneamente existía una propuesta previa de Data
Science (`docs/data/BBDD.sql`, documentada en ADR-0003) que ya no representa la dirección
acordada para el backend. Para evitar confusión futura, es necesario declarar con claridad
qué fichero manda.

## Decisión

### 1. `docs/data/schema-real/init.sql` es la fuente de verdad actual

- Es el SQL **real** de la base de datos del proyecto.
- `backend/prisma/schema.prisma` debe ser su **espejo fiel**: mismo nombre de tablas
  (via `@@map`), mismos campos (snake_case), mismo `onDelete`.
- Cualquier cambio en el esquema de la DB **parte de `init.sql`** y se refleja en
  `schema.prisma`. No al revés.

### 2. `docs/data/BBDD.sql` queda como referencia histórica

- Fue una propuesta de Data Science (arquitectura normalizada con `pgvector`, entidades
  en español, etc.). Ya **no guía la implementación** del backend.
- Se conserva en el repo como documento de referencia, **no como contrato activo**.
- No debe usarse para generar migraciones, poblar el schema.prisma ni diseñar endpoints.

### 3. `events` es la entidad central del MVP

- La tabla `events` de `init.sql` (y su espejo `Event` en Prisma) es la entidad principal
  del producto: planes, actividades y eventos familiares.
- El endpoint `GET /api/events` (y `/:id`) expone esta entidad.
- Las entidades `Activity`, `Review`, `Incident`, `Favorite` del MVP previo
  **permanecen en el runtime mock** hasta que se tome una decisión explícita sobre su
  migración, retirada o integración como tablas separadas en `init.sql`.

### 4. No se añaden `reviews`/`incidents` persistentes hasta decisión explícita

- `init.sql` no define tablas de reseñas ni incidencias.
- La API mock de `POST /api/reviews` y `POST /api/incidents` sigue funcionando en memoria,
  pero **no se modela en Prisma ni en init.sql** hasta que el equipo decida su estructura.

### 5. El runtime sigue mock hasta la rama de migración específica

- `schema.prisma` es modelo/documentación y preparación. No se han ejecutado migraciones.
- Los services del backend siguen sirviendo datos en memoria (ADR-0001 vigente).
- La transición a PostgreSQL real se abordará en una rama dedicada (`feat/backend-prisma-runtime` o equivalente).

## Consecuencias

- ✅ Claridad inequívoca sobre qué SQL guía el desarrollo backend/Prisma.
- ✅ `BBDD.sql` no genera confusión: su rol queda explícitamente acotado.
- ✅ Equipo de Data Science sabe que `init.sql` es el contrato activo.
- ⚠️ Si `init.sql` cambia (añade tablas, renombra columnas), hay que actualizar `schema.prisma` a la par.
- ⚠️ La decisión sobre `reviews`/`incidents` (¿tablas nuevas en `init.sql`? ¿endpoints retirados?) está pendiente y debe tomarse antes de la migración a runtime Prisma.
- ➡️ Próximo paso: cuando llegue la rama de migración a runtime, partir siempre de `init.sql` actualizado como referencia y no de `BBDD.sql`.

## Correcciones recibidas sobre `init.sql`

- **2026-06-03 · ubicación de `rating`** (`init_variable_corregida.sql`): `rating` se movió de
  `plans` a `user_selected_recommendations` (la valoración pertenece a la recomendación elegida
  por el usuario, no al plan). Aplicado al `init.sql` versionado, al `schema.prisma` y mediante
  la migración incremental `move_rating_from_plans_to_user_selected_recommendations` (sin tocar
  la migración inicial). Detalle en
  [../features/db-move-rating-to-selected-recommendations.md](../features/db-move-rating-to-selected-recommendations.md).

## Relacionado

- [ADR-0001](0001-prisma-preparado-no-runtime.md) — Prisma preparado pero no runtime.
- [ADR-0003](0003-divergencia-sql-data-vs-prisma.md) — contexto histórico (superado por este ADR).
- [../data/schema-real/init.sql](../data/schema-real/init.sql) — fuente de verdad.
- [../data/BBDD.sql](../data/BBDD.sql) — referencia histórica (no contrato activo).
- [../features/backend-prisma-real-schema.md](../features/backend-prisma-real-schema.md) — detalle de implementación.
