# Refactor · Helper común de serialización de eventos

- **Fecha:** 2026-06-03
- **Rama:** `refactor/backend-event-serialization-utils` (desde `feature/backend`)
- **Estado:** implementado · tests 59/59 verdes · pendiente de PR a `feature/backend`
- **Tipo:** refactor interno (sin cambio de comportamiento ni de contrato)

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Qué problema resuelve

La lógica de **serialización de eventos** (convertir los tipos de Prisma a JSON estable)
estaba **duplicada en tres services**:

- `event.service.js`
- `recommendation.service.js`
- `favorite.service.js`

Cada uno tenía su propia copia de `toNum`, `toISO` y `serializeEvent` (~20 líneas × 3).
Duplicación = riesgo de divergencia: si se añade un campo Decimal/Date nuevo, había que
acordarse de actualizar tres sitios.

---

## Qué cambia

Se extrae la lógica a un **helper común**: [`backend/src/utils/serializeEvent.js`](../../backend/src/utils/serializeEvent.js).

Exporta:

| Función | Responsabilidad |
|---|---|
| `serializeEvent(event)` | Normaliza un evento crudo (Prisma o mock) al shape público estable |
| `toNumberOrNull(value)` | Decimal/number/string numérico → `number`; `null`/`undefined` → `null` |
| `toIsoOrNull(value)` | `Date` → ISO string; string ISO → se mantiene; `null`/`undefined` → `null` |

Conversiones aplicadas por `serializeEvent` (idénticas a las tres copias previas):

```
lat, lng, edad_minima, multiplicador   → number | null
fecha_inicio, fecha_fin                → ISO string | null
(resto de campos: intactos)
```

Los tres services ahora **importan** el helper en lugar de tener su propia copia.
`recommendation.service.js` usa además `toNumberOrNull` dentro de `scoreEvent`
(donde antes usaba su `toNum` local).

---

## Qué NO cambia

- **Contrato público idéntico**: `/api/events`, `/api/recommendations`, `/api/favorites`
  devuelven exactamente el mismo shape y tipos que antes. Verificado por los 50 tests previos.
- **Runtime**: sin cambios. No toca la DB.
- `init.sql`, `schema.prisma`, migraciones, `seed.js` — no se tocan.
- Controllers, rutas, repositories — no se tocan.
- Frontend, auth, assistant/IA, reviews/incidents/plans — no se tocan.
- `docs/api.md` — no se toca (el contrato no cambia).

---

## Archivos afectados

| Archivo | Operación |
|---|---|
| `backend/src/utils/serializeEvent.js` | **Creado** — helper común |
| `backend/src/services/event.service.js` | Importa `serializeEvent`; eliminadas las funciones locales |
| `backend/src/services/recommendation.service.js` | Importa `serializeEvent` + `toNumberOrNull`; eliminadas locales; `toNum` en `scoreEvent` → `toNumberOrNull` |
| `backend/src/services/favorite.service.js` | Importa `serializeEvent`; eliminadas las funciones locales |
| `backend/src/tests/serializeEvent.test.js` | **Creado** — test unitario del helper (9 tests) |

---

## Contrato mantenido

Los 50 tests de integración existentes (events, recommendations, favorites, assistant…)
**siguen verdes sin modificarse**, lo que confirma que el shape de respuesta no cambió.
El refactor es puramente interno.

---

## Validación ejecutada

```
npm run test:backend  →  10 suites · 59/59 tests verdes
                          (50 previos intactos + 9 nuevos del helper)
```

Suites:

```
✓ serializeEvent.test.js  (9)   ← nuevo
✓ events.test.js          (11)
✓ recommendations.test.js (12)
✓ favorites.test.js       (7)
✓ assistant.test.js       (4)
✓ activities.test.js      (5)
✓ reviews.test.js         (3)
✓ incidents.test.js       (3)
✓ error.test.js           (4)
✓ health.test.js          (1)
```

---

## Riesgos

- **Campos Decimal/Date nuevos**: si en el futuro se añaden columnas Decimal o Date a la
  tabla `events`, hay que actualizar `serializeEvent` para incluirlas. Ahora es **un único
  sitio** (antes eran tres) — ése es precisamente el beneficio del refactor.
- **Sin riesgo de comportamiento**: la lógica extraída es copia exacta de la previa; los
  tests de integración lo verifican end-to-end.

---

## Siguiente paso recomendado

- Ninguno obligatorio. Si en el futuro otros recursos (p. ej. `plans`, `offers`) necesitan
  serialización similar, considerar un helper genérico parametrizable o helpers por entidad.
- Mantener el helper como punto único de verdad para la serialización de `events`.

---

## Referencias

- [Feature events runtime](backend-events-prisma-runtime.md)
- [Feature recommendations runtime](backend-recommendations-events-runtime.md)
- [Feature favorites runtime](backend-favorites-events-runtime.md)
- [Contrato API](../api.md)
