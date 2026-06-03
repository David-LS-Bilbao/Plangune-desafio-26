# DB · Mover `rating` de `plans` a `user_selected_recommendations`

- **Fecha:** 2026-06-03
- **Rama:** `fix/db-move-rating-to-selected-recommendations` (desde `feature/backend`)
- **Estado:** implementado · migración aplicada en local · tests 50/50 verdes · pendiente de PR a `feature/backend`
- **Tipo:** corrección de schema real (sin cambio de runtime ni de contrato de endpoints)

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Contexto

Data nos pasó una corrección menor del schema real (`init_variable_corregida.sql`):

| Antes | Ahora |
|---|---|
| `plans.rating integer` | `plans` **sin** `rating` |
| `user_selected_recommendations` sin rating | `user_selected_recommendations.rating integer` |

**Interpretación:** la valoración (`rating`) pertenece a la **recomendación seleccionada por
el usuario**, no al plan. Es donde tiene sentido: un usuario valora la recomendación que eligió.

Regla arquitectónica aplicada: **el backend se adapta al schema real**, no al revés.

---

## Qué cambia

1. **`docs/data/schema-real/init.sql`** (fuente de verdad, ADR-0004):
   - Quitado `rating integer` de `plans`.
   - Añadido `rating integer` a `user_selected_recommendations`.

2. **`backend/prisma/schema.prisma`**:
   - `Plan`: eliminado `rating Int?`.
   - `UserSelectedRecommendation`: añadido `rating Int?`.

3. **Nueva migración incremental** `move_rating_from_plans_to_user_selected_recommendations`:

   ```sql
   ALTER TABLE "plans" DROP COLUMN "rating";
   ALTER TABLE "user_selected_recommendations" ADD COLUMN "rating" INTEGER;
   ```

---

## Qué NO cambia

- **Runtime de endpoints**: ninguno usa `rating` (ni `plans` ni `user_selected_recommendations`
  tienen endpoints activos). `/api/events`, `/api/recommendations`, `/api/favorites` intactos.
- **La migración inicial** `20260602221433_init_real_schema_from_init_sql` **no se toca**
  (ya está versionada y puede haber sido aplicada por otros). La corrección entra como
  migración **incremental** nueva.
- Frontend, controllers, services, repositories, routes — no se tocan.
- `seed.js` — no se toca (no siembra `rating`).
- reviews/incidents/auth/assistant/favorites/recommendations — sin cambios.

---

## Por qué migración incremental (y no editar la inicial)

Editar la migración inicial ya mergeada rompería el historial de migraciones de quien ya la
haya aplicado (checksum distinto → Prisma detectaría drift). La forma correcta de corregir un
schema ya versionado es **añadir una migración nueva** que aplique el `ALTER TABLE`. Así:

- Quien ya tenga la DB creada solo aplica el incremento.
- El historial de migraciones queda consistente y reproducible.

---

## Archivos afectados

| Archivo | Operación |
|---|---|
| `docs/data/schema-real/init.sql` | Editado (rating movido) |
| `backend/prisma/schema.prisma` | Editado (`Plan` − rating, `UserSelectedRecommendation` + rating) |
| `backend/prisma/migrations/20260603075051_move_rating_from_plans_to_user_selected_recommendations/migration.sql` | **Creado** (generado por `prisma migrate dev`) |
| `docs/features/db-move-rating-to-selected-recommendations.md` | **Creado** (este doc) |
| `docs/adr/0004-real-schema-source-of-truth.md` | Nota de la corrección |

---

## Validación ejecutada

```
npm run prisma:format   --workspace backend   →  Formatted prisma/schema.prisma 🚀
npm run prisma:generate --workspace backend   →  ✔ Prisma Client (v6.19.3)
npx prisma migrate dev --name move_rating...   →  migración creada y aplicada;
                                                  "Your database is now in sync" (sin drift, sin reset)
npm run test:backend                          →  9 suites · 50/50 tests verdes
```

SQL generado (verificado, coincide con lo esperado):

```sql
ALTER TABLE "plans" DROP COLUMN "rating";
ALTER TABLE "user_selected_recommendations" ADD COLUMN "rating" INTEGER;
```

---

## Cómo aplicarlo en otra DB local

```bash
docker compose up -d postgres
npm run prisma:generate --workspace backend
npm run prisma:migrate  --workspace backend   # aplica la migración incremental
npm run db:seed         --workspace backend   # opcional (seed no usa rating)
```

---

## Riesgos y limitaciones

- **`DROP COLUMN "rating"` en `plans`** elimina esa columna y sus datos. En desarrollo/demo
  no había datos en `plans.rating` (el seed no la rellenaba), así que no hay pérdida real.
  En un entorno con datos, esa columna se perdería: es el cambio solicitado y correcto.
- **Nuevo `rating` en `user_selected_recommendations`** es `NULL`able y sin endpoint que lo
  rellene todavía: queda preparado para cuando se implemente la lógica de valoración de
  recomendaciones.
- Aviso esperado de Prisma en la migración: *"You are about to drop the column `rating` on
  the `plans` table. All the data in the column will be lost."* — correcto y asumido.

---

## Siguiente paso recomendado

- Cuando se implemente la funcionalidad de valorar recomendaciones, usar
  `user_selected_recommendations.rating` (ya disponible en el modelo).
- Mantener `init.sql` como fuente de verdad: futuras correcciones de Data se reflejan primero
  ahí y luego en `schema.prisma` + migración incremental.

---

## Referencias

- [ADR-0004 · Fuente de verdad del schema](../adr/0004-real-schema-source-of-truth.md)
- [Guía de DB local](../database.md)
- [Schema real](../data/schema-real/init.sql)
