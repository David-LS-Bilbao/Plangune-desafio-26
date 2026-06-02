# PostgreSQL local · DESAFIO-26

> **Fuente de verdad del schema:** [`docs/data/schema-real/init.sql`](data/schema-real/init.sql)
> · `backend/prisma/schema.prisma` es su espejo fiel (11 modelos) · **Runtime: mock en memoria**
> (sin migraciones ejecutadas todavía). Ver [ADR-0004](adr/0004-real-schema-source-of-truth.md).
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
npm run prisma:migrate  --workspace backend    # aplica las migraciones
npm run prisma:studio   --workspace backend    # abre la GUI de la DB (opcional)
```

> El `schema.prisma` ya modela las **tablas reales** de `data/schema-real/init.sql` (ver
> "Modelo de datos" más abajo) y **no se han ejecutado migraciones** todavía.
>
> **Estado del runtime por endpoint:**
> - `GET /api/events`, `GET /api/events/:id` → **Prisma/PostgreSQL** cuando la DB local
>   está levantada y sembrada (ver [features/backend-events-prisma-runtime.md](features/backend-events-prisma-runtime.md)).
> - Resto de endpoints (`/api/activities`, `/api/recommendations`, `/api/reviews`,
>   `/api/incidents`, `/api/favorites`, `/api/assistant`) → **mock en memoria** todavía.
> - La base real sigue siendo `data/schema-real/init.sql` (ADR-0004).

## Seed Prisma (MVP)

Existe un seed Prisma en [../backend/prisma/seed.js](../backend/prisma/seed.js) que inserta
los eventos en PostgreSQL.

- Usa **los mismos datos base** que el mock MVP (`backend/src/seed/mockEvents.js`):
  los importa para no duplicar (shape 1:1 con el modelo `Event`).
- Es **idempotente** (`upsert` por `id`): se puede ejecutar varias veces sin duplicar.
- **Todavía no sustituye los services en memoria**: el backend sigue sirviendo el mock en
  runtime. El seed se ejecutará cuando haya **DB local disponible**.

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

> El seed **no cambia todavía el runtime de la API**: los services siguen sirviendo el mock
> en memoria. Sembrar la DB no afecta a las respuestas de los endpoints por ahora.
>
> **Siguiente paso futuro:** migrar los services de memoria a Prisma (lectura/escritura real),
> manteniendo el contrato de endpoints intacto.

## 5. Parar el contenedor

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

> **Runtime mock**: los services siguen sirviendo datos en memoria; el schema es
> modelo/preparación. **No** se han ejecutado migraciones (`prisma migrate`).

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
