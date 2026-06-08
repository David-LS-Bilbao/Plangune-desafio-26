# DB · Añadir `nif` a `businesses`

- **Fecha:** 2026-06-03
- **Rama:** `fix/db-add-business-nif` (desde `feature/backend`)
- **Estado:** implementado · migración aplicada en local · tests 59/59 verdes · pendiente de PR a `feature/backend`
- **Tipo:** ampliación de schema real (sin runtime nuevo; solo DB/schema/seed/docs)

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Contexto y motivo

El **NIF/CIF/NIE** del negocio será necesario para el rol negocio/actividad y para el futuro
flujo de **registro/edición de negocios**. Se añade ahora a la tabla real `businesses` para
dejar el modelo preparado.

Regla aplicada: **la DB real manda**; el backend se adapta vía `init.sql` → Prisma → migración → seed.

---

## Decisión técnica: `nif` nullable + unique

| Capa | Definición |
|---|---|
| SQL (`init.sql`) | `nif character varying(20)` + `CONSTRAINT businesses_nif_key UNIQUE (nif)` |
| Prisma (`Business`) | `nif String? @unique @db.VarChar(20)` |

**Justificación:**
- Será **obligatorio a nivel de flujo** cuando exista el endpoint de alta/edición de negocios.
- En esta migración queda **nullable** para no romper datos existentes ni el seed.
- **`unique`** evita NIFs duplicados cuando empiece el alta real.
- PostgreSQL **permite múltiples `NULL` en una columna unique**, lo que es aceptable durante la
  transición (mientras no todos los negocios tengan NIF).

---

## Qué cambia

1. **`docs/data/schema-real/init.sql`** (fuente de verdad): columna `nif` + constraint unique en `businesses`.
2. **`backend/prisma/schema.prisma`**: `Business.nif String? @unique @db.VarChar(20)`.
3. **Nueva migración incremental** `add_nif_to_businesses`:
   ```sql
   ALTER TABLE "businesses" ADD COLUMN "nif" VARCHAR(20);
   CREATE UNIQUE INDEX "businesses_nif_key" ON "businesses"("nif");
   ```
4. **`backend/prisma/seed.js`**:
   - NIFs demo ficticios `B00000001`…`B00000005` en los 5 negocios.
   - `seedBusinesses` pasa de `update: {}` a `update: { nif: data.nif }` para **rellenar `nif` en DBs ya existentes** sin tocar otros campos. Sigue siendo idempotente.

---

## Qué NO cambia

- Controllers, services, repositories, routes, frontend — no se tocan.
- Dockerfile, compose.yaml, docs/docker-backend.md, Postman — no se tocan.
- Migraciones existentes (`init`, `move_rating`) — intactas.
- Endpoints `events`/`recommendations`/`favorites` y mocks — sin cambios (**no hay endpoint de businesses todavía**; no se crea en esta rama).
- Auth, assistant/IA — sin cambios.

---

## Nota sobre la creación de la migración (entorno no interactivo)

`npx prisma migrate dev --name add_nif_to_businesses` **falló** porque el añadido de un índice
unique genera un aviso ("si hay duplicados, fallará") que `migrate dev` quiere confirmar de forma
**interactiva**, y el entorno de ejecución no tiene TTY:

```
Error: Prisma Migrate has detected that the environment is non-interactive, which is not supported.
```

> ⚠️ **No fue un `reset`**: Prisma no pidió resetear la DB en ningún momento.

La migración se creó de forma **no interactiva y segura** con el flujo documentado de Prisma:

```bash
# 1) SQL incremental real (DB viva → schema): coincide con lo esperado
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel  prisma/schema.prisma --script

# 2) Se guardó en prisma/migrations/<timestamp>_add_nif_to_businesses/migration.sql
# 3) Se aplicó con:
npx prisma migrate deploy
```

El SQL aplicado es **idéntico** al que habría generado `migrate dev`. Como la columna se añade
vacía (todos `NULL`), el índice unique no encuentra duplicados y se crea sin problemas.

---

## Validación ejecutada

```
npm run prisma:format   --workspace backend  →  Formatted 🚀
npm run prisma:generate --workspace backend  →  ✔ Prisma Client v6.19.3
npx prisma migrate deploy                    →  Applying 20260603124110_add_nif_to_businesses ✔ (sin reset)
npm run db:seed         --workspace backend  →  5 businesses con nif B00000001..B00000005
npm run test:backend                         →  10 suites · 59/59 verdes

Smoke (psql):
  SELECT id,name,nif FROM businesses ORDER BY id;
  1 Negocio Demo 1 ... B00000001
  2 Negocio Demo 2 ... B00000002
  3 Negocio Demo 3 ... B00000003
  4 Negocio Demo 4 ... B00000004
  5 Negocio Demo 5 ... B00000005
```

---

## Riesgos y limitaciones

- **`nif` es NULL para negocios sin NIF**: aceptable durante la transición; el unique permite
  múltiples NULL.
- **NIFs demo son ficticios** (`B0000000X`), no reales. Solo para desarrollo/demo.
- **`update: { nif: data.nif }`** en el seed sobrescribe el `nif` de los negocios demo 1–5 si ya
  tuvieran otro valor. Es intencional (rellenar el campo nuevo); no toca otros campos.
- **Sin validación de formato de NIF/CIF/NIE todavía**: se hará en el endpoint de alta de negocios
  (futura rama), donde el campo pasará a ser obligatorio a nivel de flujo.

---

## Siguiente paso recomendado

- Cuando se implemente el **endpoint de alta/edición de negocios**: hacer `nif` obligatorio a
  nivel de aplicación y validar su formato (NIF/CIF/NIE).
- Mantener `init.sql` como fuente de verdad: futuras columnas se reflejan primero ahí y luego en
  `schema.prisma` + migración incremental.

---

## Referencias

- [ADR-0004 · Fuente de verdad del schema](../adr/0004-real-schema-source-of-truth.md)
- [Guía DB local](../database.md)
- [Schema real](../data/schema-real/init.sql)
- [Migración previa (rating)](db-move-rating-to-selected-recommendations.md)
