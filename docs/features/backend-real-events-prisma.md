# Feature · Integración real de `events` (Prisma + init.sql)

- **Fecha:** 2026-06-02
- **Rama:** `feat/backend-real-events-prisma` (desde `origin/feature/backend`)
- **Estado:** implementada · runtime **mock** · pendiente de revisión humana y PR a `feature/backend`
- **Alcance:** primera integración segura del backend con la base de datos real. **No** es el MVP completo.

> Documento de memoria/registro de la feature. Nombre técnico estable: `DESAFIO-26`.
> App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## 1. Contexto y objetivo

El backend partía de una API **mock** centrada en la entidad `Activity`. El equipo recibió la
base de datos real en [`backend/src/models/init.sql`](../../backend/src/models/init.sql), donde la
entidad central es **`events`**.

Objetivo de esta tarea: **adaptar el backend a `events`** de forma segura, sin romper lo existente:

- Modelar `events` en Prisma (espejo de `init.sql`).
- Exponer endpoints reales `GET /api/events` y `GET /api/events/:id`.
- Implementar los filtros mínimos de búsqueda.
- Mantener **runtime mock** (sin conectar PostgreSQL todavía, ver [ADR-0001](../adr/0001-prisma-preparado-no-runtime.md)).
- No tocar frontend, ni auth, ni IA. No instalar dependencias.

## 2. Decisión de fuente de verdad

- La fuente real es **`init.sql`** (tabla `events`, plana, con `municipio`/`territorio`/`tipo_evento`
  como columnas directas).
- El shape del contrato y del mock replica **exactamente** las columnas de `init.sql` (snake_case),
  para que **mock == futuro runtime Prisma == DB**, sin fricción al migrar.

> ⚠️ `init.sql` **difiere** de la propuesta previa de Data Science en
> [`docs/data/BBDD.sql`](../data/BBDD.sql) (esquema normalizado `eventos` + `comercios`/`categorias`
> + `pgvector`). Esta divergencia debe reconciliarse en un ADR (ver §8 y [ADR-0003](../adr/0003-divergencia-sql-data-vs-prisma.md)).

## 3. Modelo de datos · `Event` (espejo de `events`)

Definido en [`backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma). Campos (snake_case = columnas reales):

| Campo | Tipo Prisma | Columna `init.sql` |
|---|---|---|
| `id` | `Int @id @default(autoincrement())` | `id serial` |
| `business_id` | `Int?` (escalar; relación diferida) | `business_id integer` (FK businesses) |
| `fuente` | `String? @db.VarChar(20)` | `fuente varchar(20)` |
| `external_id` | `String?` | `external_id text` |
| `title` | `String @db.VarChar(150)` | `title varchar(150) NOT NULL` |
| `description` | `String?` | `description text` |
| `categoria` | `String? @db.VarChar(50)` | `categoria varchar(50)` |
| `tipo_plantilla` | `String? @db.VarChar(100)` | `tipo_plantilla varchar(100)` |
| `municipio` | `String? @db.VarChar(100)` | `municipio varchar(100)` |
| `territorio` | `String? @db.VarChar(30)` | `territorio varchar(30)` |
| `address` | `String?` | `address text` |
| `lat` / `lng` | `Decimal? @db.Decimal(9,6)` | `numeric(9,6)` |
| `telefono` | `String? @db.VarChar(30)` | `telefono varchar(30)` |
| `email` | `String? @db.VarChar(100)` | `email varchar(100)` |
| `website` | `String?` | `website text` |
| `es_interior` | `Boolean @default(false)` | `es_interior boolean` |
| `es_carrito` | `Boolean @default(false)` | `es_carrito boolean` |
| `es_cambiador` | `Boolean @default(false)` | `es_cambiador boolean` |
| `es_silla_ruedas` | `Boolean @default(false)` | `es_silla_ruedas boolean` |
| `es_mascotas` | `Boolean @default(false)` | `es_mascotas boolean` |
| `edad_minima` | `Decimal? @db.Decimal` | `edad_minima numeric` |
| `multiplicador` | `Decimal? @default(1.00) @db.Decimal(3,2)` | `multiplicador numeric(3,2)` |
| `fecha_inicio` | `DateTime @db.Timestamp(6)` | `fecha_inicio timestamp NOT NULL` |
| `fecha_fin` | `DateTime? @db.Timestamp(6)` | `fecha_fin timestamp` |
| `lugar` | `String? @db.VarChar(255)` | `lugar varchar(255)` |
| `price` | `String? @db.VarChar` | `price varchar` (texto libre) |
| `imagen_url` | `String?` | `imagen_url text` |
| `tipo_evento` | `String? @db.VarChar(100)` | `tipo_evento varchar(100)` |

- Tabla mapeada con `@@map("events")`.
- Índices declarativos en `municipio`, `territorio`, `categoria`, `tipo_evento`, `fecha_inicio`.
- `events` **no tiene** columna de estado/moderación → `GET /api/events` devuelve **todos** los eventos.

## 4. Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/events` | Lista eventos (con filtros opcionales) |
| `GET` | `/api/events/:id` | Detalle por `id` (entero); `404` si no existe |

Contrato detallado y ejemplo de respuesta en [`docs/api.md`](../api.md#eventos-entidad-central--datos-reales-de-initsql).

### Filtros (query string) → columna real

| Filtro | Columna | Semántica |
|---|---|---|
| `municipio` | `municipio` | igualdad (case-insensitive) |
| `territorio` | `territorio` | igualdad (Bizkaia/Gipuzkoa/Araba) |
| `categoria` | `categoria` | igualdad |
| `tipo_evento` | `tipo_evento` | igualdad |
| `es_interior` | `es_interior` | booleano |
| `es_carrito` | `es_carrito` | booleano |
| `es_cambiador` | `es_cambiador` | booleano |
| `edad` | `edad_minima` | **apto si `edad_minima ≤ edad`** |
| `fecha_desde` | `fecha_inicio` | `fecha_inicio ≥ fecha_desde` |
| `fecha_hasta` | `fecha_inicio` | `fecha_inicio ≤ fecha_hasta` |

Validación con `express-validator` (booleanos, `edad` entero ≥ 0, fechas ISO 8601). Filtro inválido → **422** `{ "error": "<mensaje>" }`.

## 5. Arquitectura (MVC) y archivos

```txt
request → routes/event.routes.js → controllers/event.controller.js → services/event.service.js → mockEvents.js
```

| Archivo | Acción | Rol |
|---|---|---|
| `backend/prisma/schema.prisma` | modificado | Modelo `Event` (sustituye a Activity/Review/Incident/Favorite) |
| `backend/src/seed/mockEvents.js` | nuevo | 10 eventos de Euskadi con shape real |
| `backend/src/services/event.service.js` | nuevo | `getEvents(filtros)`, `getEventById(id)` (lanza 404) |
| `backend/src/controllers/event.controller.js` | nuevo | `listEvents`, `getEvent` (finos, `asyncHandler`) |
| `backend/src/routes/event.routes.js` | nuevo | Rutas + validación de filtros |
| `backend/src/routes/index.js` | modificado | Monta `/events` |
| `backend/prisma/seed.js` | modificado | Siembra `events` (upsert idempotente) |
| `backend/src/tests/events.test.js` | nuevo | 11 tests Vitest + Supertest |
| `docs/api.md` | modificado | Sección Eventos + tabla resumen |
| `backend/src/models/init.sql` | fuente | DB real (untracked; ver §8) |

## 6. Runtime: mock con shape real

- El endpoint sirve `backend/src/seed/mockEvents.js`, cuyo shape coincide 1:1 con el modelo `Event`.
- **No se consulta PostgreSQL** todavía: el backend arranca sin DB/Docker (coherente con [ADR-0001](../adr/0001-prisma-preparado-no-runtime.md)).
- El `schema.prisma` y `prisma/seed.js` quedan **preparados** para el salto a runtime, manteniendo
  el mismo contrato.

## 7. Verificación

| Comando | Resultado |
|---|---|
| `npm run prisma:format --workspace backend` | ✅ schema válido |
| `npm run prisma:generate --workspace backend` | ✅ cliente `Event` generado (sin DB) |
| `npm run test:backend` | ✅ **40 tests / 9 suites** |

- **+11 tests** nuevos (`events.test.js`): list 200+array; filtros territorio/municipio(ci)/es_carrito/edad/rango-fechas/combinado; 422 (booleano y `edad` inválidos); `:id` 200 y 404.
- **29 tests previos intactos** (la API mock anterior sigue verde).

## 8. Decisiones y deuda registrada

### Decisiones tomadas
- **Shape snake_case** = columnas de `init.sql` (mock == DB).
- **`business_id` escalar** (sin relación a `businesses` todavía).
- **`activities` se mantiene**: los endpoints mock previos conviven con `events` (migración/retirada en paso posterior).
- **Sin `status`** en events: no hay filtrado por moderación.

### Riesgos / deuda
| Tema | Prioridad | Nota |
|---|---|---|
| Divergencia `init.sql` ↔ `docs/data/BBDD.sql` | **P1** | Dos esquemas distintos; ADR-0003 se escribió sobre BBDD.sql. Falta fijar fuente de verdad. |
| Doble entidad viva (`activities` mock + `events`) | **P1** | Planificar migración/retirada de activities. |
| `init.sql` sin versionar | **P1** | Está untracked en `backend/src/models/`; decidir si se commitea y dónde (¿`docs/data/`?). |
| `seed.js` requiere DB para ejecutarse | **P2** | Runtime sigue mock; al pasar a Prisma habrá que convertir `Decimal` (lat/lng/edad_minima) → number. |
| Resto de tablas de `init.sql` sin modelar | **P2** | `businesses`, `users`, `families`, `plans`, `offers`, `favorites`… en pasos posteriores. |

## 9. Próximos pasos recomendados

1. **ADR** que fije `init.sql` como fuente de verdad real y reconcilie con `BBDD.sql`/[ADR-0003](../adr/0003-divergencia-sql-data-vs-prisma.md).
2. Versionar `init.sql` en el repo (ubicación a decidir).
3. **Migración a Prisma runtime**: Docker + `DATABASE_URL` + `prisma migrate`, sustituyendo el mock en `event.service.js` sin cambiar el contrato.
4. Modelar el resto de tablas de `init.sql` y planificar la retirada de la API mock `activities`.

## 10. Referencias

- Contrato de API: [`docs/api.md`](../api.md)
- Schema Prisma: [`backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma)
- DB real: [`backend/src/models/init.sql`](../../backend/src/models/init.sql)
- Estrategia de calidad: [`docs/quality/README.md`](../quality/README.md)
- ADRs: [0001 (Prisma no runtime)](../adr/0001-prisma-preparado-no-runtime.md) · [0003 (divergencia SQL)](../adr/0003-divergencia-sql-data-vs-prisma.md)
