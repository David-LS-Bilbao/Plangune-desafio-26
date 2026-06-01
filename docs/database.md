# PostgreSQL local · DESAFIO-26

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

> En el bootstrap aún no hay modelos Prisma reales. `prisma:migrate` creará la base
> de datos vacía. Los modelos llegan en ramas posteriores.

## Seed Prisma (MVP)

Existe un seed Prisma en [../backend/prisma/seed.js](../backend/prisma/seed.js) que inserta
las actividades en PostgreSQL.

- Usa **los mismos datos base** que el mock MVP (`backend/src/seed/mockActivities.js`):
  los importa para no duplicar, conserva los IDs `act-001…` e incluye la actividad `pending`.
- Es **idempotente** (`upsert` por `id`): se puede ejecutar varias veces sin duplicar.
- **Todavía no sustituye los services en memoria**: el backend sigue sirviendo el mock en
  runtime. El seed se ejecutará cuando haya **DB local disponible**.

Ejecución (requiere DB levantada y cliente Prisma generado; ver pasos 2 y 4):

```bash
# desde el workspace backend, con backend/.env y Postgres en marcha
npm run prisma:generate --workspace backend   # si no se ha generado el cliente
node prisma/seed.js                            # ejecutar el seed (idempotente)
```

> Opcional: registrar el seed en `backend/package.json` como `"prisma": { "seed": "node prisma/seed.js" }`
> para poder usar `npx prisma db seed`. No se ha modificado `package.json` en esta tarea.
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

## Modelo de datos (MVP)

Los modelos mínimos viven en [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) y
están alineados con el contrato documentado en [api.md](api.md). Objetivo: poder sustituir
**progresivamente** el almacenamiento mock en memoria **sin cambiar URLs ni el shape de las
respuestas**.

### Modelos

| Modelo     | Propósito                                  | Relaciones                       |
| ---------- | ------------------------------------------ | -------------------------------- |
| `Activity` | Actividad / plan familiar                  | 1—N `Review`, `Incident`, `Favorite` |
| `Review`   | Reseña de una actividad (entra `pending`)  | N—1 `Activity`                   |
| `Incident` | Incidencia sobre una actividad (entra `open`) | N—1 `Activity`                |
| `Favorite` | Favorito de un usuario (mock por ahora)    | N—1 `Activity`                   |

### Enums

| Enum             | Valores                          | Notas                                    |
| ---------------- | -------------------------------- | ---------------------------------------- |
| `ActivityStatus` | `pending` `approved` `rejected`  | El contrato expone `"approved"`          |
| `ReviewStatus`   | `pending` `approved` `rejected`  | Reseñas entran como `pending`            |
| `IncidentStatus` | `open` `in_review` `resolved`    | Incidencias entran como `open`           |
| `PriceType`      | `free` `low` `medium` `high`     | El contrato expone `"medium"`            |

### Decisiones de modelo

- **Valores de enum en minúscula**: coinciden 1:1 con el JSON del contrato actual
  (`api.md`), para no cambiar el shape de respuesta al migrar del mock a Prisma.
- **`Activity.id` es `String`**: conserva los identificadores legibles del mock
  (`"act-001"`) cuando se prepare el seed; evita exponer enteros autoincrementales.
- **`averageRating` se mantiene como campo denormalizado** en `Activity` (no se calcula
  en vivo): refleja el contrato actual y mantiene KISS. Recalcularlo desde `Review`
  queda para una rama posterior.
- **`Favorite` sin modelo `User` todavía**: se usa `userId String @default("mock-user")`
  y `@@unique([userId, activityId])` para idempotencia. Cuando exista auth real, ese
  `userId` pasará a referenciar el modelo `User`. No se crea `User` en esta rama (KISS).
- **`category` y `Incident.type` son `String`** (no enum): son conjuntos abiertos que
  conviene no congelar todavía.
- **`onDelete: Cascade`** en las relaciones hijas: al borrar una actividad se limpian sus
  reseñas, incidencias y favoritos.
- **Índices mínimos**: `Activity.status`, `Activity(province, municipality)` y las claves
  foráneas, pensando en los filtros del recomendador (Family Score).

> **Pendiente (no incluido en esta rama):** el seed equivalente a los datos mock y la
> sustitución de los services. Ver notas en el resumen de la rama `feat/backend-prisma-models`.
> No se han ejecutado migraciones (`prisma migrate`) todavía: requiere decisión humana y DB local.
