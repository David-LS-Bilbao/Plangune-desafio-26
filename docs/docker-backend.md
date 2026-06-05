# Docker backend · DESAFIO-26

## 1. Objetivo

Esta configuración permite levantar **PostgreSQL + backend** con Docker Compose para pruebas
locales **reproducibles**: cualquiera del equipo arranca el mismo entorno con un par de comandos,
sin depender de su instalación local de Node.

> Alcance: **solo desarrollo/validación local**. No es un entorno de producción.

## 2. Servicios Docker

| Servicio | Descripción | Puerto host | Uso |
|---|---|---|---|
| `postgres` | PostgreSQL 16 local de desarrollo | 5434 | DB real |
| `backend` | API Express DESAFIO-26 (Prisma) | 3000 | API REST |

Definidos en [`compose.yaml`](../compose.yaml). El `backend` se construye desde
[`backend/Dockerfile`](../backend/Dockerfile) (build context = `./backend`).

## 3. Decisión técnica: `node` simple, NO `nodemon`

Dentro del contenedor usamos:

```
node src/server.js
```

**No** usamos:

```
nodemon src/server.js
```

**Motivos:**
- El contenedor aquí **no** está pensado para hot-reload.
- **No** montamos el código fuente como volumen para desarrollo interactivo.
- `nodemon` añade file-watching innecesario en este escenario.
- `node` es más simple, estable y parecido a producción.
- Reduce ruido en logs y reinicios inesperados.
- El desarrollo con **recarga automática sigue disponible en el host**:

  ```bash
  npm run dev:backend
  ```

**Resumen:**
- **Host/local para programar** → `nodemon` (`npm run dev:backend`).
- **Docker para validar entorno reproducible** → `node` simple.

## 4. Arquitectura local

- Desde el **host** accedes a la API en `http://localhost:3000`.
- Desde el **host** accedes a PostgreSQL en `localhost:5434`.
- **Dentro de Docker**, el backend conecta a PostgreSQL usando el host **`postgres`**
  (nombre del servicio en la red de Compose), **no** `localhost`.
- Por eso `DATABASE_URL` en Docker **no** usa `localhost`:

  ```
  postgresql://desafio26:desafio26_dev_password@postgres:5432/desafio26_dev?schema=public
  ```

  (Si dentro del contenedor pusieras `localhost`, intentaría conectar al propio contenedor del
  backend, donde no hay PostgreSQL → fallo de conexión.)

- El cliente Prisma se genera **durante el build** (`npx prisma generate`) para la plataforma del
  contenedor (Linux), independientemente del SO del host (macOS/Windows/Linux).

## 5. Comandos principales

```bash
# Construir la imagen del backend
docker compose build backend

# Levantar postgres + backend (backend espera a que postgres esté healthy)
docker compose up -d postgres backend

# Ver estado de los contenedores
docker compose ps

# Ver logs
docker compose logs backend
docker compose logs postgres
docker compose logs -f backend   # en streaming

# Parar (conserva los datos del volumen)
docker compose down
```

## 6. Migraciones y seed

El backend **no** ejecuta migraciones ni seed en el `CMD` del contenedor.

**Motivos:**
- evita efectos secundarios al arrancar;
- separa la aplicación de las tareas de base de datos;
- es más claro para desarrollo y despliegue.

**Dentro de Docker (recomendado):**

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node prisma/seed.js
```

> Se usa `prisma migrate deploy` (no `migrate dev`): aplica las migraciones versionadas de forma
> no interactiva y sin shadow DB, lo apropiado para un contenedor. Es idempotente.

**Alternativa desde el host** (la DB expone el puerto `5434`):

```bash
npm run prisma:migrate --workspace backend
npm run db:seed        --workspace backend
```

## 7. Validación manual con curl

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/events
curl http://localhost:3000/api/events/1
curl "http://localhost:3000/api/recommendations?childrenAges=2&strollerFriendly=true&rainSuitable=true"
curl http://localhost:3000/api/favorites
```

Resultado esperado (con DB migrada y sembrada): health 200, 10 eventos, recomendaciones con
`event` + `activity` (alias legacy), favoritos GET/POST/DELETE correctos.

## 8. Uso con Postman

La colección Postman funciona igual contra el backend Docker (mismo `baseUrl`):

- [docs/postman/README.md](postman/README.md)
- [docs/postman/DESAFIO-26-backend-runtime.postman_collection.json](postman/DESAFIO-26-backend-runtime.postman_collection.json)
- [docs/postman/DESAFIO-26-local.postman_environment.json](postman/DESAFIO-26-local.postman_environment.json)

## 9. Diferencia entre modos de ejecución

| Modo | Comando | Uso recomendado |
|---|---|---|
| Backend local (host) | `npm run dev:backend` | Desarrollar con nodemon (hot-reload) |
| DB Docker + backend host | `docker compose up -d postgres` + `npm run dev:backend` | Desarrollo habitual |
| Backend Docker + DB Docker | `docker compose up -d postgres backend` | Validación reproducible |

## 10. Problemas frecuentes

- **Puerto 3000 ocupado**: un backend de host (`npm run dev:backend`) ya usa el 3000. Párelo antes
  de `docker compose up backend`, o cambia el mapeo de puerto del servicio backend.
- **Puerto 5434 ocupado**: otro servicio local choca con el mapeo host del contenedor. Párelo
  o cambia el puerto izquierdo del servicio postgres. Dentro de Docker debe seguir siendo
  `postgres:5432`.
- **`DATABASE_URL` con `localhost` dentro del contenedor**: error de conexión. Dentro de Docker
  debe ser host `postgres`. Ya está fijado así en `compose.yaml`.
- **DB sin migraciones**: `/api/events` falla. Ejecuta `docker compose exec backend npx prisma migrate deploy`.
- **DB sin seed**: `/api/events` devuelve `[]`. Ejecuta `docker compose exec backend node prisma/seed.js`.
- **Los cambios de código no se reflejan automáticamente**: es esperado — **no** usamos nodemon ni
  montamos volumen. Tras cambiar código, reconstruye: `docker compose build backend && docker compose up -d backend`.
- **`docker compose down -v` borra los datos locales** (volumen `desafio26_postgres_data`). Úsalo
  solo si quieres partir de cero.

## 11. Qué NO cubre esta rama

- No dockeriza el frontend.
- No crea un entorno de producción.
- No añade CI/CD.
- No cambia la lógica del backend.
- No cambia el schema Prisma.
- No cambia el seed.
- No añade hot-reload en Docker.

## 12. Siguiente paso recomendado

- Validar la colección Postman contra el backend Docker.
- Si el equipo quiere desarrollo full-Docker con hot-reload, crear una rama separada:
  `chore/backend-docker-dev-hot-reload` (montaría el código como volumen + nodemon).
- Si se prepara despliegue, crear un `Dockerfile`/`compose` de producción separado (multi-stage,
  `npm ci --omit=dev`, usuario no-root, etc.).

## Validación ejecutada en esta rama

```
docker compose build backend                          →  ✔ imagen construida, Prisma Client (Linux) generado
docker compose up -d postgres backend                 →  backend espera a postgres healthy, ambos Up
docker compose ps                                     →  desafio26_backend Up (0.0.0.0:3000->3000)
curl /api/health                                      →  {"status":"ok","service":"DESAFIO-26 API"}
docker compose exec backend npx prisma migrate deploy →  2 migraciones, sin pendientes
docker compose exec backend node prisma/seed.js       →  6 users (5 business + family 100), 5 businesses, 10 events
curl /api/events                                      →  10 eventos (lat:number)
curl /api/events/1                                    →  id=1
curl /api/recommendations?...                         →  3 recs (event + activity, score 90)
curl /api/favorites (POST/GET/DELETE)                 →  201 / 1 fav / 200
```

## Referencias

- [compose.yaml](../compose.yaml) · [backend/Dockerfile](../backend/Dockerfile) · [backend/.dockerignore](../backend/.dockerignore)
- [Guía DB local](database.md) · [Contrato API](api.md)
- [Auditoría runtime](audits/backend-db-runtime-audit.md)
