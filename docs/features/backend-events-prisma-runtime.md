# Feature · Migración runtime de `/api/events` a Prisma/PostgreSQL

- **Fecha:** 2026-06-03
- **Ramas:**
  - `feat/backend-events-prisma-runtime` — migración runtime de `/api/events` a Prisma
  - `fix/backend-seed-events-runtime` — corrección del seed (fechas + FK chain + syncSequences)
- **Estado:** implementada + seed corregido · tests 40/40 verdes · pendiente de PR a `feature/backend`

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## Objetivo

Migrar **únicamente** los endpoints de eventos (`GET /api/events` y `GET /api/events/:id`)
de un runtime mock en memoria a **Prisma/PostgreSQL**, sin modificar la base de datos ni
el contrato público de la API.

El resto del backend (recommendations, favorites, reviews, incidents, activities, assistant)
**sigue en mock** y no se toca en esta rama.

---

## Contexto previo

| Qué existía | Estado antes de esta rama |
|---|---|
| `docs/data/schema-real/init.sql` | Fuente de verdad de la DB (ver ADR-0004) |
| `backend/prisma/schema.prisma` | Espejo fiel de `init.sql` (11 modelos, sin migraciones ejecutadas) |
| `GET /api/events` y `/:id` | Funcionaban con `mockEvents` en memoria |
| Arquitectura | controller → service (llamaba directamente a mockEvents) |

---

## Cambio realizado

### Arquitectura aplicada

```
controller → service → repository → Prisma/PostgreSQL
```

| Capa | Responsabilidad |
|---|---|
| **Repository** (`event.repository.js`) | Traduce filtros a cláusula `where` de Prisma; ejecuta `findMany`/`findUnique`; devuelve filas crudas |
| **Service** (`event.service.js`) | Llama al repository; serializa campos Prisma a tipos JSON estables; lanza 404 si no existe |
| **Controller** (`event.controller.js`) | Parsea query params; llama al service con `await`; devuelve JSON. Cambio mínimo: `await` añadido |

### Archivos modificados/creados

| Archivo | Operación | Descripción |
|---|---|---|
| `backend/src/repositories/event.repository.js` | **Creado** | Nueva capa que encapsula Prisma |
| `backend/src/services/event.service.js` | **Modificado** | Pasa de `mockEvents` a repository async; añade `serializeEvent` |
| `backend/src/controllers/event.controller.js` | **Modificado mínimo** | Solo añadido `await` en 2 líneas |
| `backend/src/tests/events.test.js` | **Modificado** | Mock del repository con `vi.mock` para tests sin DB real |

---

## Qué NO cambia

- `docs/data/schema-real/init.sql` — no se toca.
- `backend/prisma/schema.prisma` — no se toca.
- Contrato público de `/api/events` (URLs, filtros, shape de respuesta) — **estable**.
- Frontend.
- Auth.
- Recommendations, favorites, reviews, incidents, activities, assistant.
- El resto de endpoints siguen en mock en memoria.

---

## Corrección del seed (`fix/backend-seed-events-runtime`)

El seed inicial fallaba al ejecutarse contra PostgreSQL real por dos causas independientes:

### Problema 1 — Fechas sin timezone

`mockEvents.js` almacena `fecha_inicio` y `fecha_fin` como strings sin offset de timezone:
```
"2026-06-10T10:00:00"   ← Prisma rechaza: "premature end of input · expected ISO-8601 DateTime"
```
**Solución:** el helper `prepareEventForPrisma()` convierte cada fecha a `new Date(string)`
antes del upsert. Prisma acepta objetos `Date` de JavaScript directamente.

### Problema 2 — Cadena de claves foráneas

Los eventos del mock referencian `business_id` 1–5, pero la tabla `businesses` estaba vacía.
A su vez, `businesses` requiere `user_id` válido en `users`. La cadena completa es:

```
users  ←(FK)  businesses  ←(FK nullable)  events
```

Si se intenta insertar un evento con `business_id: 1` antes de crear ese negocio,
PostgreSQL lanza un error de FK. **Solución:** el seed siembra las tablas en orden:

```
seedUsers() → seedBusinesses() → seedEvents() → syncSequences()
```

### `syncSequences()` — por qué es necesaria

Los upserts usan IDs explícitos (1–5 para users y businesses; 1–10 para events).
PostgreSQL no avanza las secuencias SERIAL automáticamente cuando se insertan IDs
explícitos, por lo que el próximo insert sin ID explícito podría generar un ID ya
ocupado (conflicto de clave primaria). `syncSequences()` corrige esto ejecutando:
```sql
SELECT setval(pg_get_serial_sequence('tabla', 'id'), COALESCE(MAX(id), 0), true) FROM "tabla"
```
para cada tabla afectada (`users`, `businesses`, `events`).

---

## Serialización Decimal/DateTime

Prisma devuelve campos `Decimal` (lat, lng, edad_minima, multiplicador) como objetos
`Prisma.Decimal` y `DateTime` (fecha_inicio, fecha_fin) como objetos `Date` de JavaScript.
El service normaliza ambos tipos antes de devolver la respuesta JSON:

- `Decimal` → `Number` (via `Number(val.toString())`)
- `Date` → ISO string (via `.toISOString()`)

Esta normalización garantiza que el shape público sea idéntico al del mock previo.

---

## Cómo probar en local (requiere PostgreSQL)

### 1. Levantar PostgreSQL con Docker

```bash
docker compose up -d postgres
docker compose exec postgres pg_isready -U desafio26 -d desafio26_dev
```

### 2. Generar el cliente Prisma

```bash
npm run prisma:generate --workspace backend
```

### 3. Crear las tablas (aplicar la migración)

> La migración `20260602221433_init_real_schema_from_init_sql` está en
> `backend/prisma/migrations/` y **debe estar versionada en el repo** para que el equipo
> pueda recrear la DB local sin construir el schema manualmente. No modifica `init.sql` ni
> `schema.prisma`.

```bash
# Opción recomendada — aplica la migración versionada del repo
npm run prisma:migrate --workspace backend

# Alternativa rápida para desarrollo local (no genera archivo de migración)
cd backend && npx prisma db push
```

### 4. Sembrar datos de prueba

El seed crea los datos necesarios **en este orden** (solo para desarrollo/demo local):

1. **5 usuarios demo** (`negocio1@demo.eus` … `negocio5@demo.eus`, role `'business'`) con IDs explícitos 1–5.
2. **5 negocios demo** vinculados a esos usuarios con IDs explícitos 1–5 — necesarios como FK porque `mockEvents` referencia `business_id` 1–5.
3. **10 eventos** de `mockEvents.js` (IDs del mock; `fecha_inicio`/`fecha_fin` convertidos a `Date`).
4. **Resincronización de secuencias SERIAL** (`users`, `businesses`, `events`) para evitar choques de autoincrement en futuros inserts sin ID explícito.

Todos los upserts son idempotentes: puede ejecutarse varias veces sin duplicar.

```bash
npm run db:seed --workspace backend
# Equivalente: cd backend && node prisma/seed.js
```

### 5. Arrancar el backend

```bash
npm run dev:backend
```

### 6. Llamadas de ejemplo

```bash
# Listar todos los eventos
curl http://localhost:3000/api/events

# Filtrar por municipio y accesibilidad
curl "http://localhost:3000/api/events?municipio=Bilbao&es_carrito=true"

# Filtrar por rango de fechas
curl "http://localhost:3000/api/events?fecha_desde=2026-07-01&fecha_hasta=2026-07-31"

# Detalle por id
curl http://localhost:3000/api/events/1

# 404 esperado
curl http://localhost:3000/api/events/999999
```

---

## Validación ejecutada

```
npm run prisma:generate --workspace backend  →  ✔ Generated Prisma Client (v6.19.3)
npm run db:seed --workspace backend          →  5 users · 5 businesses · 10 events · secuencias sincronizadas ✅
npm run test:backend                         →  9 suites · 40/40 tests · verdes
curl http://localhost:3000/api/events        →  10 eventos desde PostgreSQL real
curl /api/events/1                           →  200 id=1 title='Exposición interactiva en el museo'
curl /api/events?municipio=Bilbao&es_carrito=true → 2 eventos (ids 1, 3)
```

Los tests **no requieren PostgreSQL**: el repository se mockea con `vi.mock` en
`events.test.js`. El mock replica la lógica de filtrado sobre `mockEvents`, verificando
el comportamiento de service, controller y validación sin depender de la DB real.

---

## Riesgos y limitaciones

- **Requiere DB local levantada y sembrada** para el runtime real. Sin PostgreSQL, el
  backend arranca pero `/api/events` fallará con un error de conexión.
- **Los tests no requieren DB** gracias al mock del repository. Esto es intencional.

> ⚠️ **Timezone en fechas (riesgo a tener en cuenta antes de producción):**
> `mockEvents.js` usa strings sin timezone (`"2026-06-10T10:00:00"`). El seed los convierte
> con `new Date(string)`, que los interpreta en la **timezone local del servidor**. En una
> máquina con UTC+2, la hora almacenada en PostgreSQL será 2h antes de lo previsto (UTC).
> Para el MVP de desarrollo es aceptable (los datos son ficticios). Si se necesita hora
> exacta de evento, añadir `Z` o el offset explícito a las fechas del mock/seed antes de
> pasar a producción o a datos reales.

- `recommendations` siguen usando su propio flujo mock (activities); no consumen `Event` de Prisma.
- `reviews`/`incidents`/`favorites` siguen en mock; sus entidades no existen en `init.sql`.
- Decimal/DateTime se serializan en el service. Si Prisma cambia el tipo de un campo, hay
  que actualizar `serializeEvent` en el service.
- **Seed con IDs explícitos:** si la DB ya tiene registros con el email `negocioN@demo.eus`
  en IDs distintos de 1–5, el upsert por `id` puede fallar por unique constraint en `email`.
  Solución: truncar las tablas afectadas y relanzar el seed.

## Rollback funcional

Si la DB local no está disponible y se necesita recuperar el endpoint, se puede apuntar
temporalmente el service de vuelta a `mockEvents` (revertir `event.service.js`). No hacerlo
en esta rama salvo emergencia; documentar el cambio si se hace.

---

## Siguiente paso recomendado

Migrar `GET /api/recommendations` para que use los eventos reales de la tabla `events`
en lugar del mock de `mockActivities`. Pero en **rama separada**, siguiendo el mismo
patrón controller → service → repository.

---

## Referencias

- [ADR-0001 · Prisma no-runtime](../adr/0001-prisma-preparado-no-runtime.md)
- [ADR-0004 · Fuente de verdad del schema](../adr/0004-real-schema-source-of-truth.md)
- [Contrato API](../api.md)
- [Guía de DB local](../database.md)
- [Feature previa (schema Prisma real)](backend-prisma-real-schema.md)
