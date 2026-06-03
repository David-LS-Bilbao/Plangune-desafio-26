# Auditoría · Estado de DB y runtime backend · DESAFIO-26

- **Fecha:** 2026-06-03
- **Rama de auditoría:** `audit/backend-db-runtime-status` (desde `feature/backend`)
- **Auditor:** revisión read-only (no se modificó código, schema, migraciones ni seed)
- **Commit base:** `feature/backend` @ `ddfa232` (PR #29 merge, rating incremental)

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).
>
> **Validación manual complementaria:** colección Postman en
> [../postman/README.md](../postman/README.md) para probar los endpoints descritos aquí.

---

## 1. Resumen ejecutivo

El backend está en un estado **sano y coherente**. La cadena fuente de verdad → Prisma →
migraciones → seed → runtime está alineada. Tres endpoints ya consultan PostgreSQL real
(`/api/events`, `/api/recommendations`, `/api/favorites`); el resto sigue en mock y está
**documentado como tal**. La corrección de `rating` (de `plans` a `user_selected_recommendations`)
se aplicó correctamente como migración incremental sin tocar la inicial.

**Veredicto:** **APTO** para seguir avanzando. **Sin hallazgos P0**. Hay deuda controlada
(aliases legacy, endpoints mock, ausencia de auth) bien documentada. La integración de
`feature/backend` hacia una rama superior **no debe hacerse todavía** porque el frontend aún
no está integrado (decisión de equipo) y quedan endpoints mock por migrar.

- Tests: **59/59 verdes** (10 suites).
- Smoke real (PostgreSQL): `/api/events`, `/api/recommendations`, `/api/favorites` **OK**.

---

## 2. Estado actual

| Dimensión | Estado |
|---|---|
| Fuente de verdad del schema | `docs/data/schema-real/init.sql` (ADR-0004) |
| Modelo Prisma | 11 modelos, espejo de `init.sql` |
| Migraciones | inicial + incremental de `rating`, ambas versionadas |
| Runtime real | `/api/events`, `/api/recommendations`, `/api/favorites` |
| Runtime mock/legacy | `/api/activities`, `/api/reviews`, `/api/incidents`, `/api/assistant` |
| Auth | no implementada (usuario family mock id 100) |
| IA del asistente | no implementada (fallback reglado) |

---

## 3. Tabla de componentes

| Componente | Estado | Evidencia | Notas |
|---|---|---|---|
| **DB schema** (`init.sql`) | ✅ correcto | `rating` en `user_selected_recommendations` (L118); ausente en `plans` | Fuente de verdad |
| **Prisma schema** | ✅ correcto | `rating Int?` solo en `UserSelectedRecommendation` (L196); 0 en `Plan` | Espejo fiel |
| **Migración inicial** | ✅ intacta | `20260602221433_init_real_schema_from_init_sql` no editada | — |
| **Migración incremental** | ✅ correcta | `20260603075051_move_rating...`: `DROP COLUMN rating` + `ADD COLUMN rating INTEGER` | Orden correcto, posterior a la inicial |
| **migration_lock.toml** | ✅ | `provider = "postgresql"` | — |
| **Seed** | ✅ correcto | orden users→businesses→events→syncSequences; family id 100; upsert idempotente | Ver §Seed |
| **events** (runtime) | ✅ real | controller→service→repository→Prisma; smoke 10 eventos | `lat` serializado a number |
| **recommendations** (runtime) | ✅ real | usa `findEvents({})`; smoke 3 recs, score+reasons | alias `activity` presente |
| **favorites** (runtime) | ✅ real | `user_favorite_events`; smoke POST/GET/DELETE OK | usuario mock 100 |
| **serializeEvent util** | ✅ centralizado | `utils/serializeEvent.js`, usado por los 3 services | refactor PR #28 |
| **mocks legacy** | 🟡 mock | activities/reviews/incidents/assistant | documentado como mock |
| **docs** | ✅ coherente | api.md/database.md/features actualizados | sin menciones obsoletas a `Plan.rating` |
| **tests** | ✅ 59/59 | 10 suites verdes | repos mockeados, sin DB |

---

## 4. Clasificación runtime real / mock / alias / pendiente

### Runtime real (PostgreSQL vía Prisma)
- `GET /api/events`, `GET /api/events/:id`
- `GET /api/recommendations` (sobre `events`)
- `GET/POST/DELETE /api/favorites` (sobre `user_favorite_events`)

### Mock / legacy (en memoria)
- `GET /api/activities`, `GET /api/activities/:id` — entidad `Activity` mock.
- `POST /api/reviews` — entra `pending`, en memoria.
- `POST /api/incidents` — entra `open`, en memoria.
- `POST /api/assistant/family-plan` — **matiz**: el asistente NO usa IA (fallback reglado),
  pero **sus datos sí son reales**: reutiliza `getRecommendations`, que consulta `events` de
  Prisma. Es "fallback sin IA sobre datos reales".

### Alias temporales (compatibilidad frontend)
- `recommendations`: cada item incluye `event` (clave nueva) **y** `activity` (alias del mismo objeto).
- `favorites`: la respuesta incluye `eventId` (nuevo) **y** `activityId` (alias); la ruta usa `:activityId`.

### Pendiente
- Auth real (sustituir `MOCK_FAMILY_USER_ID = 100`).
- IA real del asistente.
- Migración de `activities`/`reviews`/`incidents` a tablas reales (no existen en `init.sql`).
- Retirada de aliases `activity`/`activityId` cuando el frontend migre.

---

## 5. Hallazgos por severidad

### P0 · Bloqueante
**Ninguno.** El backend arranca, los tests pasan, el contrato es estable y el runtime real funciona.

### P1 · Importante (antes de integrar con frontend / a rama superior)
- **P1-1 · Endpoints mock conviviendo con reales sin contrato unificado.** `activities` (mock,
  ids string `act-00x`) y `events` (real, ids numéricos) coexisten. El frontend debe saber cuál
  consumir. Mitigado por docs, pero es fuente de confusión. *Recomendación:* decidir si
  `activities` se retira o se mapea a `events`.
- **P1-2 · Aliases legacy sin fecha de retirada.** `activity`/`activityId` son deuda temporal
  sin criterio explícito de cuándo se eliminan. *Recomendación:* fijar que se retiran cuando el
  frontend confirme migración a `event`/`eventId`, y registrar un issue.
- **P1-3 · `reviews`/`incidents` no tienen tabla en `init.sql`.** Persisten en memoria; se
  pierden al reiniciar. Antes de venderlos como funcionales en demo, aclarar su naturaleza.

### P2 · Mejora
- **P2-1 · `package.json#prisma` deprecado.** Prisma avisa: la config de seed en `package.json`
  se eliminará en Prisma 7; migrar a `prisma.config.ts`. No urgente.
- **P2-2 · `/api/events` sin orden determinista.** `findEvents({})` no fija `orderBy`; el smoke
  devolvió el primer evento con id=8. No es bug, pero un `orderBy` daría salida estable.
- **P2-3 · `user_selected_recommendations.rating` sin uso.** Columna preparada pero sin endpoint
  que la rellene. Correcto como preparación; pendiente de funcionalidad.
- **P2-4 · `businesses.plan` es `Int?` suelto** (no FK, fiel a `init.sql`). Documentado; vigilar
  si Data pretende que sea FK.

### P3 · Nota
- **P3-1 · Riesgo de timezone** en fechas del seed/mock (`"2026-06-10T10:00:00"` sin TZ → se
  interpreta en hora local del servidor). Documentado en la feature de events. Aceptable en MVP.
- **P3-2 · Seed solo para desarrollo/demo** (passwords placeholder, no hashes). Correcto; no usar
  en entornos compartidos.
- **P3-3 · Duplicación de serialización ya resuelta** por el refactor (`serializeEvent` único).
  Nota positiva; no queda deuda aquí.

---

## 6. Riesgos

| Riesgo | Severidad | Estado |
|---|---|---|
| Confusión frontend activities(mock) vs events(real) | P1 | Documentado, no resuelto |
| Aliases legacy sin retirada planificada | P1 | Documentado |
| Pérdida de reviews/incidents al reiniciar (mock memoria) | P1 | Documentado |
| `prisma` en package.json deprecado (Prisma 7) | P2 | Pendiente |
| Timezone de fechas | P3 | Documentado |
| Sin auth: favoritos de un único usuario mock | P1/contexto | Esperado en esta fase |

---

## 7. Recomendaciones

1. **No integrar `feature/backend` a `dev`/rama superior todavía** (decisión de equipo: esperar a frontend; quedan endpoints mock).
2. Registrar issues para: retirada de aliases `activity`/`activityId`; decisión sobre `activities` mock; persistencia real de reviews/incidents.
3. Añadir `orderBy` determinista a `/api/events` (P2-2) en una rama menor.
4. Planificar la migración de la config de seed a `prisma.config.ts` antes de subir a Prisma 7.
5. Cuando llegue auth, sustituir `MOCK_FAMILY_USER_ID` por el usuario autenticado en favoritos.

---

## 8. Checklist antes de integrar `feature/backend` hacia una rama superior

- [ ] Frontend integrado y consumiendo la API real (no solo mocks propios).
- [ ] Decisión tomada sobre `activities` mock (retirar o mapear a `events`).
- [ ] Aliases `activity`/`activityId` con plan de retirada acordado con frontend.
- [ ] `reviews`/`incidents`: decidir persistencia real o etiquetar claramente como no persistente en demo.
- [ ] Auth mínima o decisión explícita de demo sin auth.
- [ ] `npm run test:backend` verde (hoy 59/59).
- [ ] Migraciones aplicables en limpio (`prisma migrate` sin drift).
- [ ] Revisar la incidencia del merge accidental a `dev` (ver `docs/git/incidents/`) por si el PR sale vacío.
- [ ] CORS: definir `CLIENT_URL` explícito en el entorno de integración (deuda de `docs/security.md`).

---

## 9. Próximos pasos sugeridos

1. **Frontend → API real**: conectar pantallas críticas a `/api/events`, `/api/recommendations`, `/api/favorites` con `VITE_API_URL`.
2. **Retirar aliases legacy** tras confirmación del frontend (rama `chore/*`).
3. **Auth** (rama dedicada): users reales, roles, y favoritos por usuario autenticado.
4. **Persistencia de reviews/incidents**: definir tablas en `init.sql` (decisión Data) y migrar.
5. **Asistente IA** real (Python/Ollama) manteniendo el fallback como respaldo.

---

## Validación ejecutada en esta auditoría

```
npm run prisma:generate --workspace backend  →  ✔ Prisma Client v6.19.3
npm run test:backend                         →  10 suites · 59/59 verdes

Smoke real (PostgreSQL, server detenido limpio tras la prueba):
  GET /api/events                                   → 200, 10 eventos (lat:number)
  GET /api/recommendations?childrenAges=2&...       → 200, 3 recs (event+activity, score 90, 3 reasons)
  POST /api/favorites/1 → 201 · GET → 1 fav · DELETE /1 → 200
```

## Referencias

- [ADR-0004 · Fuente de verdad del schema](../adr/0004-real-schema-source-of-truth.md)
- [Feature events runtime](../features/backend-events-prisma-runtime.md)
- [Feature recommendations runtime](../features/backend-recommendations-events-runtime.md)
- [Feature favorites runtime](../features/backend-favorites-events-runtime.md)
- [Feature move rating](../features/db-move-rating-to-selected-recommendations.md)
- [Refactor serialization](../features/backend-event-serialization-utils.md)
- [Contrato API](../api.md) · [Guía DB local](../database.md) · [Seguridad](../security.md)
- [Incidencia merge a dev](../git/incidents/2026-06-02-accidental-dev-merge.md)
