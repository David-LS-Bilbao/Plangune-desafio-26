# PostgreSQL local · DESAFIO-26

> **Fuente de verdad del schema:** [`docs/data/schema-real/init.sql`](data/schema-real/init.sql)
> · `backend/prisma/schema.prisma` es su espejo fiel (11 modelos).
> · **La migración inicial existe** en `backend/prisma/migrations/` y debe aplicarse antes del seed.
> · **Runtime de `/api/events`:** Prisma/PostgreSQL (cuando la DB está levantada).
> · **Resto de endpoints:** mock en memoria todavía. Ver [ADR-0004](adr/0004-real-schema-source-of-truth.md).
>
> `docs/data/BBDD.sql` es referencia histórica, **no el contrato activo**.

Guía para levantar y usar PostgreSQL local con Docker Compose y conectarlo con Prisma.

> **Credenciales de desarrollo local** (no son reales; son ficticias para uso local).
> Nunca uses estas credenciales en producción ni las commitees en archivos `.env`.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose plugin).
- Archivo `compose.yaml` en la raíz del repo (ya incluido).
- Archivo `backend/.env` copiado desde `backend/.env.example`.

## 1. Preparar el entorno

```bash
# Desde la raíz del repo
cp backend/.env.example backend/.env
```

El archivo `backend/.env` ya contiene la `DATABASE_URL` correcta para el contenedor local:

```
DATABASE_URL="postgresql://desafio26:desafio26_dev_password@localhost:5432/desafio26_dev?schema=public"
```

## 2. Levantar la base de datos

```bash
docker compose up -d postgres
```

El contenedor arranca en segundo plano. El healthcheck confirma cuando PostgreSQL está listo para aceptar conexiones.

## 3. Verificar estado y conexión

```bash
# Estado del contenedor
docker compose ps

# Verificar que PostgreSQL acepta conexiones
docker compose exec postgres pg_isready -U desafio26 -d desafio26_dev

# Ver logs en tiempo real
docker compose logs -f postgres
```

## 4. Aplicar migraciones con Prisma

Con el contenedor activo y `backend/.env` configurado:

```bash
npm run prisma:generate --workspace backend   # genera el cliente Prisma
npm run prisma:migrate  --workspace backend    # aplica las migraciones (crea las tablas)
npm run prisma:studio   --workspace backend    # abre la GUI de la DB (opcional)
```

> **Migración disponible:** la carpeta `backend/prisma/migrations/` contiene la migración
> `20260602221433_init_real_schema_from_init_sql` que crea las 11 tablas del schema real.
> **Debe estar versionada en el repo** para que cualquier miembro del equipo pueda recrear
> la DB local con `prisma migrate` sin necesidad de construir el schema manualmente.
>
> **Estado del runtime por endpoint:**
> - `GET /api/events`, `GET /api/events/:id` → **Prisma/PostgreSQL** cuando la DB local
>   está levantada y sembrada (ver [features/backend-events-prisma-runtime.md](features/backend-events-prisma-runtime.md)).
> - Resto de endpoints (`/api/activities`, `/api/recommendations`, `/api/reviews`,
>   `/api/incidents`, `/api/favorites`, `/api/assistant`) → **mock en memoria** todavía.
> - La base real sigue siendo `data/schema-real/init.sql` (ADR-0004).

## Seed Prisma (desarrollo local / demo)

Existe un seed en [../backend/prisma/seed.js](../backend/prisma/seed.js) que popula la DB
local con datos de prueba. **Solo para desarrollo/demo. No usar en entornos compartidos.**

### Por qué el seed crea users y businesses además de events

La tabla `events` tiene una FK opcional `business_id → businesses.id`, y `businesses`
tiene FK obligatoria `user_id → users.id`. Si `users` o `businesses` están vacíos cuando
se insertan los eventos con `business_id` 1–5, PostgreSQL rechaza la inserción con error
de clave foránea. El seed respeta la cadena de dependencias:

```
users  ←  businesses  ←  events
```

Además, `fecha_inicio` y `fecha_fin` en `mockEvents.js` son strings sin timezone
(`"2026-06-10T10:00:00"`). Prisma requiere objetos `Date` o strings ISO-8601 completos;
sin la conversión, el seed falla con "premature end of input · expected ISO-8601 DateTime".

### Pasos del seed (en orden)

1. **`seedUsers`** — 5 usuarios demo de tipo `'business'` (IDs explícitos 1–5, passwords placeholders).
2. **`seedBusinesses`** — 5 negocios demo vinculados a esos usuarios (IDs explícitos 1–5, necesarios como FK de `events`).
3. **`seedEvents`** — 10 eventos de `mockEvents.js`; las fechas se convierten a `new Date(...)` antes del upsert.
4. **`syncSequences`** — resincroniza las secuencias SERIAL de `users`, `businesses` y `events` al `MAX(id)` actual, para que futuros inserts sin ID explícito no choquen con los IDs ya ocupados.

Todos los upserts son **idempotentes**: puede ejecutarse varias veces sin duplicar.

El seed está **registrado** en `backend/package.json`:

- `"prisma": { "seed": "node prisma/seed.js" }` → habilita `prisma db seed`.
- script cómodo `db:seed` → `prisma db seed`.

**Prerequisitos:** PostgreSQL levantado (paso 2), `backend/.env` configurado y las **tablas
creadas** (aplicar el modelo con `prisma migrate`/`prisma db push`, ver paso 4). El seed
**no** crea las tablas: solo inserta datos.

```bash
# 0. (opcional) validar el schema sin conectar a la DB
npx prisma validate --schema backend/prisma/schema.prisma

# 1. generar el cliente Prisma si aún no existe
npm run prisma:generate --workspace backend

# 2. ejecutar el seed (idempotente) — requiere DB en marcha y tablas creadas
npm run db:seed --workspace backend
# alternativa equivalente:
#   npx prisma db seed            (desde el workspace backend)
#   node prisma/seed.js           (ejecución directa)
```

> **Después del seed**, `/api/events` y `/api/events/:id` consultan PostgreSQL directamente.
> El resto de endpoints (`/api/activities`, `/api/recommendations`, `/api/reviews`,
> `/api/incidents`, `/api/favorites`, `/api/assistant`) siguen usando mock en memoria y
> no se ven afectados por el seed.
>
> **Siguiente paso futuro:** migrar el resto de services de memoria a Prisma, manteniendo
> el contrato de endpoints intacto.
>
> ⚠️ **Riesgo timezone:** `mockEvents.js` usa strings sin timezone (`"2026-06-10T10:00:00"`).
> `new Date(string)` los interpreta en la timezone local del servidor, por lo que la hora
> almacenada en PostgreSQL puede diferir de la prevista (p. ej. UTC+2 → 2h antes en UTC).
> Para el MVP de desarrollo es aceptable. Si se necesita hora exacta de evento, añadir `Z`
> o el offset explícito a las fechas del mock/seed antes de pasar a producción.

## 5. Setup completo desde cero (todos los pasos validados)

Secuencia completa para tener el backend con `/api/events` funcionando contra PostgreSQL real:

```bash
# 1. Copiar variables de entorno (solo la primera vez)
cp backend/.env.example backend/.env

# 2. Levantar PostgreSQL
docker compose up -d postgres
docker compose exec postgres pg_isready -U desafio26 -d desafio26_dev

# 3. Generar el cliente Prisma
npm run prisma:generate --workspace backend

# 4. Crear las tablas (aplica la migración del repo)
npm run prisma:migrate --workspace backend

# 5. Poblar con datos de prueba (users demo + businesses demo + events)
npm run db:seed --workspace backend

# 6. Arrancar el backend
npm run dev:backend

# 7. Verificar endpoints
curl http://localhost:3000/api/events                                      # array de 10 eventos
curl http://localhost:3000/api/events/1                                    # evento id=1
curl "http://localhost:3000/api/events?municipio=Bilbao&es_carrito=true"   # 2 eventos
curl "http://localhost:3000/api/events?fecha_desde=2026-07-01&fecha_hasta=2026-07-31"
curl http://localhost:3000/api/events/999999                               # 404
```

> **Nota:** los tests (`npm run test:backend`) no requieren PostgreSQL — el repository
> se mockea con `vi.mock`. Pueden ejecutarse en cualquier momento sin levantar Docker.

## 6. Parar el contenedor

```bash
# Para el contenedor pero conserva los datos del volumen
docker compose down
```

## 6. Resetear datos (destruye el volumen)

> **Atención:** el siguiente comando **borra todos los datos locales** del volumen
> `desafio26_postgres_data`. Úsalo solo si quieres empezar desde cero.

```bash
docker compose down -v
```

## Referencia rápida

| Acción                  | Comando                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| Levantar DB             | `docker compose up -d postgres`                                       |
| Ver estado              | `docker compose ps`                                                   |
| Ver logs                | `docker compose logs -f postgres`                                     |
| Verificar conexión      | `docker compose exec postgres pg_isready -U desafio26 -d desafio26_dev` |
| Parar (datos intactos)  | `docker compose down`                                                 |
| Resetear datos ⚠️       | `docker compose down -v`                                              |
| Generar cliente Prisma  | `npm run prisma:generate --workspace backend`                         |
| Aplicar migraciones     | `npm run prisma:migrate --workspace backend`                          |

## Configuración del contenedor

| Parámetro          | Valor                       |
| ------------------ | --------------------------- |
| Imagen             | `postgres:16-alpine`        |
| Nombre contenedor  | `desafio26_postgres`        |
| Puerto             | `5432:5432`                 |
| Base de datos      | `desafio26_dev`             |
| Usuario            | `desafio26`                 |
| Contraseña (local) | `desafio26_dev_password`    |
| Volumen            | `desafio26_postgres_data`   |

## Propuesta de modelo de Data Science

Existe una propuesta de esquema SQL aportada por Data Science en
[data/BBDD.sql](data/BBDD.sql), documentada en [data/README.md](data/README.md).

> Es una **propuesta documental, no ejecutable**: no es la fuente de verdad del backend
> y está **pendiente de alineación** con el modelo Prisma MVP. No ejecutarla ni migrarla.

## Modelo de datos (real · `init.sql`)

El `schema.prisma` ([../backend/prisma/schema.prisma](../backend/prisma/schema.prisma)) es ahora
**espejo completo** de la base de datos real [data/schema-real/init.sql](data/schema-real/init.sql)
(11 tablas). Campos en **snake_case** (= columnas reales) y `@@map` a cada tabla.

> **Migración inicial aplicada** (`20260602221433_init_real_schema_from_init_sql`).
> `GET /api/events` usa Prisma/PostgreSQL. El resto de services siguen en mock en memoria.

### Modelos

| Modelo | Tabla | PK | Relaciones (onDelete) |
| --- | --- | --- | --- |
| `User` | `users` | `id` | 1:1 `Business`; 1:N `Family`, `Plan` (creator), favoritos y recomendaciones |
| `Family` | `families` | `id` | N:1 `User` (Cascade); 1:N `FamilyMember` |
| `FamilyMember` | `family_members` | `id` | N:1 `Family` (Cascade) |
| `Business` | `businesses` | `id` | N:1 `User` (Cascade, `user_id` único → 1:1); 1:N `Event`, `Offer` |
| `Event` | `events` | `id` | N:1 `Business` (**SetNull**); 1:N `PlanEvent`, favoritos, recomendaciones |
| `Offer` | `offers` | `id` | N:1 `Business` (Cascade) |
| `Plan` | `plans` | `id` | N:1 `User` (creator, **SetNull**); 1:N `PlanEvent`, `UserFavoritePlan` |
| `PlanEvent` | `plan_events` | `plan_id + event_id` | N:1 `Plan`, `Event` (Cascade) |
| `UserFavoriteEvent` | `user_favorite_events` | `user_id + event_id` | N:1 `User`, `Event` (Cascade) |
| `UserFavoritePlan` | `user_favorite_plans` | `user_id + plan_id` | N:1 `User`, `Plan` (Cascade) |
| `UserSelectedRecommendation` | `user_selected_recommendations` | `user_id + event_id` | N:1 `User`, `Event` (Cascade) |

### Decisiones de modelo

- **snake_case** en los campos (= columnas reales); sin `@map` por campo. `@@map` para el nombre de tabla.
- **PKs compuestas** con `@@id([...])` en las 4 tablas puente (`plan_events`, `user_favorite_events`,
  `user_favorite_plans`, `user_selected_recommendations`).
- **`onDelete`** fiel a init.sql: `Cascade` salvo `events.business_id` y `plans.creator_id` → `SetNull`.
  `onUpdate` (NO ACTION en init.sql) se deja en el valor por defecto de Prisma; la tarea solo exige `onDelete`.
- **`businesses.plan`** es un `Int?` suelto (en init.sql **no** es FK).
- **Índices de filtro de `Event`** (`municipio`, `territorio`, `categoria`, `tipo_evento`,
  `fecha_inicio`) se mantienen para `/api/events`; no están en init.sql.
- **Sin `reviews`/`incidents`**: no existen en init.sql. La API mock previa de reviews/incidents/
  activities sigue en runtime hasta su migración/retirada.

> **Pendiente (no en esta rama):** migrar los services de memoria a Prisma runtime y ejecutar
> migraciones (`prisma migrate`) con DB local. Detalle en
> [features/backend-prisma-real-schema.md](features/backend-prisma-real-schema.md).
