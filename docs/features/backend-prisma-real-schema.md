# Feature · Schema Prisma real completo (espejo de `init.sql`)

- **Fecha:** 2026-06-02
- **Rama:** `feat/backend-prisma-real-schema` (desde `feature/backend`)
- **Estado:** implementada · runtime **mock** · sin migraciones · pendiente de revisión humana y PR a `feature/backend`
- **Alcance:** **solo modelo Prisma**. No toca endpoints, services, runtime ni frontend.

> Documento de memoria/registro de la feature. Nombre técnico estable: `DESAFIO-26`.

---

## 1. Contexto y objetivo

La primera integración de `events` solo modelaba `Event` en Prisma (ver
[backend-real-events-prisma.md](backend-real-events-prisma.md)). Esta tarea **completa**
`backend/prisma/schema.prisma` para reflejar **todas** las tablas reales de
[`docs/data/schema-real/init.sql`](../data/schema-real/init.sql) (11 tablas), preparando el
terreno para una futura migración a Prisma runtime **sin** cambiar el contrato actual.

- **Runtime intacto:** sigue en mock en memoria (ADR-0001). El schema es modelo/preparación.
- **Sin migraciones:** no se ejecutó `prisma migrate` (regla de la tarea).

## 2. Modelos (11 · espejo de `init.sql`)

| Modelo | Tabla (`@@map`) | PK | onDelete relevante |
|---|---|---|---|
| `User` | `users` | `id` serial | — (referenciado) |
| `Family` | `families` | `id` serial | `user` → Cascade |
| `FamilyMember` | `family_members` | `id` serial | `family` → Cascade |
| `Business` | `businesses` | `id` serial | `user` → Cascade (`user_id` único → 1:1) |
| `Event` | `events` | `id` serial | `business` → **SetNull** |
| `Offer` | `offers` | `id` serial | `business` → Cascade |
| `Plan` | `plans` | `id` serial | `creator` → **SetNull** |
| `PlanEvent` | `plan_events` | `plan_id + event_id` | `plan`, `event` → Cascade |
| `UserFavoriteEvent` | `user_favorite_events` | `user_id + event_id` | `user`, `event` → Cascade |
| `UserFavoritePlan` | `user_favorite_plans` | `user_id + plan_id` | `user`, `plan` → Cascade |
| `UserSelectedRecommendation` | `user_selected_recommendations` | `user_id + event_id` | `user`, `event` → Cascade |

## 3. Decisiones de modelado

- **Nombres snake_case** en los campos (= columnas reales), consistente con el `Event` previo.
  El nombre de tabla se mapea con `@@map("<tabla>")`; no hace falta `@map` por campo.
- **Claves primarias compuestas** con `@@id([...])` en las 4 tablas puente.
- **`onDelete` fiel a init.sql:** `Cascade` en la mayoría; **`SetNull`** en `events.business_id`
  y `plans.creator_id` (ambos FK opcionales).
- **`onUpdate`:** init.sql usa `NO ACTION`; se deja el valor por defecto de Prisma (la tarea solo
  exige respetar `onDelete`). Es deuda menor a afinar si se introspecciona/migra.
- **Relación 1:1 `User`↔`Business`:** `businesses.user_id` es `@unique`.
- **`businesses.plan`** se modela como `Int?` (en init.sql es un entero suelto, **no** una FK).
- **`Event` intacto:** se conservan todos sus campos escalares (shape de `/api/events` sin cambios);
  solo se **añaden** las relaciones (`business`, `plan_events`, favoritos, recomendaciones).
- **Tipos:** `numeric(9,6)`→`Decimal @db.Decimal(9,6)`, `numeric`→`Decimal @db.Decimal`,
  `timestamp`→`DateTime @db.Timestamp(6)`, `varchar(n)`→`String @db.VarChar(n)`, `serial`→`Int @default(autoincrement())`.

## 4. Lo que NO se hizo (por diseño)

- **No** se cambió runtime a Prisma (services siguen en mock).
- **No** se ejecutó `prisma migrate` (ni destructivo ni `migrate dev`).
- **No** se añadieron `reviews` ni `incidents` (no están en init.sql).
- **No** se tocaron endpoints, services, routes ni frontend.
- **No** se instalaron dependencias.

## 5. Verificación

| Comando | Resultado |
|---|---|
| `npm run prisma:format --workspace backend` | ✅ schema válido |
| `npm run prisma:generate --workspace backend` | ✅ cliente generado con los 11 modelos (sin DB) |
| `npm run test:backend` | ✅ **40 tests / 9 suites** (sin cambios; runtime mock intacto) |

## 6. Riesgos / deuda

| Tema | Prioridad | Nota |
|---|---|---|
| `onUpdate NO ACTION` no reflejado | P2 | Prisma usa `Cascade` por defecto; alinear al introspeccionar/migrar. |
| Schema ≠ runtime | P2 | El schema modela 11 tablas pero el runtime solo usa mock de `events`. Coherente con ADR-0001. |
| Reconciliación con `BBDD.sql` | P1 | Persiste la divergencia con la propuesta previa de Data Science ([ADR-0003](../adr/0003-divergencia-sql-data-vs-prisma.md)). |
| Tablas mock previas (`activities`/`reviews`/`incidents`) | P1 | Siguen vivas en runtime; no tienen tabla real. Planificar migración/retirada. |
| `package.json#prisma` deprecado | P2 | `prisma format` avisa de migrar a `prisma.config.ts` (Prisma 7). Ajeno a esta tarea. |

## 7. Próximos pasos

1. **Migración a Prisma runtime**: Docker + `DATABASE_URL` + `prisma migrate`/`db push`, sustituyendo
   el mock de `event.service.js` por consultas reales, manteniendo el contrato de `/api/events`.
2. Sustituir progresivamente el resto de la API mock (`activities`, `reviews`, `incidents`,
   `favorites`, `recommendations`, `assistant`) por las entidades reales.
3. Decidir e implementar **auth** (modelo `User` ya disponible) para `favoritos`, `plans` y negocio.
4. ADR que fije `init.sql` como fuente de verdad y cierre la divergencia con `BBDD.sql`.

## 8. Referencias

- Schema: [`backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma)
- DB real: [`docs/data/schema-real/init.sql`](../data/schema-real/init.sql)
- Guía DB: [`docs/database.md`](../database.md)
- Feature previa (events): [`backend-real-events-prisma.md`](backend-real-events-prisma.md)
- ADRs: [0001 (Prisma no runtime)](../adr/0001-prisma-preparado-no-runtime.md) · [0003 (divergencia SQL)](../adr/0003-divergencia-sql-data-vs-prisma.md)
