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
