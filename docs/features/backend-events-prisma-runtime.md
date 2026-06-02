# Feature · Migración runtime de `/api/events` a Prisma/PostgreSQL

- **Fecha:** 2026-06-03
- **Rama:** `feat/backend-events-prisma-runtime` (desde `feature/backend`)
- **Estado:** implementada · tests 40/40 verdes · pendiente de revisión humana y PR a `feature/backend`

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

### 3. Crear las tablas (aplicar el schema a la DB local)

> ⚠️ Esto crea las tablas en la DB local. No modifica `init.sql` ni `schema.prisma`.

```bash
# Opción A — migration (recomendada para entornos compartidos)
npm run prisma:migrate --workspace backend

# Opción B — push directo (más rápido para desarrollo local)
cd backend && npx prisma db push
```

### 4. Sembrar datos de prueba

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
npm run test:backend                         →  9 suites · 40/40 tests · verdes
```

Los tests **no requieren PostgreSQL**: el repository se mockea con `vi.mock` en
`events.test.js`. El mock replica la lógica de filtrado sobre `mockEvents`, verificando
el comportamiento de service, controller y validación sin depender de la DB real.

---

## Riesgos y limitaciones

- **Requiere DB local levantada y sembrada** para el runtime real. Sin PostgreSQL, el
  backend arranca pero `/api/events` fallará con un error de conexión.
- **Los tests no requieren DB** gracias al mock del repository. Esto es intencional.
- `recommendations` siguen usando su propio flujo mock (activities); no consumen `Event` de Prisma.
- `reviews`/`incidents`/`favorites` siguen en mock; sus entidades no existen en `init.sql`.
- Decimal/DateTime se serializan en el service. Si Prisma cambia el tipo de un campo, hay
  que actualizar `serializeEvent` en el service.

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
