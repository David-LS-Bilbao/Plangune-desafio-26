# Despliegue VPS (demo) · DESAFIO-26 / pLANGUNE

Guía de despliegue de la **demo** en un VPS (IONOS) detrás de **Nginx Proxy Manager (NPM)**.

> ⚠️ Documento de referencia. **No** ejecuta nada por sí mismo. No contiene secretos reales:
> todos los valores sensibles son **placeholders** (`<...>`). Antes de desplegar, completa el
> [checklist de seguridad pre-deploy](../security/predeploy-checklist.md).

## 1. Arquitectura esperada

```
Internet ──443/80──> Nginx Proxy Manager ──(red docker plangune_proxy)──> backend (Express :3000, expuesto, NO publicado)
                         │ (termina HTTPS, Force SSL)                         │
                         └─ certificados Let's Encrypt                        └──(red docker plangune_internal, interna)──> postgres :5432 (sin salida a Internet)
```

- **Solo `80` y `443` son públicos** (los gestiona NPM). Nada más se publica a Internet.
- **Express es la única fachada pública**, bajo `/api`. El frontend (build estático) se sirve por NPM o como sitio aparte y llama **solo** a `https://<tu-dominio>/api`.
- **PostgreSQL no se expone**: vive en una red Docker **interna** (`plangune_internal`, `internal: true`), alcanzable únicamente por el backend.
- **Servicios internos** (PostgreSQL, y si se añaden Ollama / Flask-Data / Redis) **nunca** se publican con `ports:`; solo `expose` en la red privada.

## 2. Ficheros relevantes

| Fichero | Rol |
|---|---|
| [`compose.prod.yaml`](../../compose.prod.yaml) | Plantilla de producción (sin `ports` públicos; `expose` + redes). |
| [`backend/Dockerfile`](../../backend/Dockerfile) | Imagen backend **no-root** (`USER node`); `.env` excluido por `.dockerignore`. |
| [`backend/.env.example`](../../backend/.env.example) | Plantilla de variables (copiar a un `.env.production` **fuera del repo**). |

## 3. Variables necesarias

En `backend/.env.production` (host, **no versionado**):

```env
NODE_ENV=production
PORT=3000
TRUST_PROXY=1                                  # detrás de NPM
CLIENT_URL=https://<tu-dominio>                # origen real del frontend (CORS)
DATABASE_URL=postgresql://<user>:<password>@postgres:5432/<db>?schema=public
JWT_SECRET=<generate_strong_secret_32+_chars>  # ver §4
JWT_EXPIRES_IN=7d
# Asistente cloud (opcional): la API key vive SOLO en backend, nunca en VITE_*
CLOUD_ASSISTANT_ENABLED=true
CLOUD_ASSISTANT_API_KEY=<gemini_api_key>
CLOUD_ASSISTANT_MODEL=gemini-2.5-flash
```

Credenciales de Postgres para `compose.prod.yaml` (env del host o `.env` junto al compose):

```env
POSTGRES_DB=<db>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<strong_password>
```

> El frontend solo usa `VITE_API_URL=https://<tu-dominio>/api`. **Ningún** secreto en `VITE_*`.

## 4. Crear secretos fuera del repo

```bash
# JWT_SECRET fuerte (>=32 chars). Guardar en backend/.env.production del HOST, no en git.
openssl rand -base64 48

# Contraseña Postgres fuerte
openssl rand -base64 32
```

- Nunca commitear `.env.production` ni `.env`. `.gitignore` y `.dockerignore` ya los excluyen.
- La validación de entorno ([`backend/src/config/env.js`](../../backend/src/config/env.js)) **impide arrancar** en `production` si falta `DATABASE_URL`/`JWT_SECRET`/`CLIENT_URL` o si `JWT_SECRET` es débil/placeholder.

## 5. Comandos de deploy previstos (NO ejecutar aquí)

```bash
# En el VPS, una sola vez: red compartida con Nginx Proxy Manager
docker network create plangune_proxy

# Build + arranque (backend + postgres en redes privadas)
docker compose -f compose.prod.yaml up -d --build

# Migraciones de base de datos (esquema real)
docker compose -f compose.prod.yaml exec backend npx prisma migrate deploy

# (Opcional) seed de datos de demo
docker compose -f compose.prod.yaml exec backend npm run db:seed
```

En **Nginx Proxy Manager**: crear un Proxy Host → `tu-dominio` → `backend:3000`, con **SSL (Let's Encrypt) + Force SSL + HTTP/2**. Añadir NPM y el backend a la red `plangune_proxy`.

## 6. Rollback básico

```bash
# Parar y volver a la imagen anterior (si se etiquetó) o reconstruir desde el commit previo
docker compose -f compose.prod.yaml down
git checkout <commit_estable_anterior>
docker compose -f compose.prod.yaml up -d --build

# Rollback de una migración concreta requiere script de bajada / restore de backup de Postgres
# (hacer dump ANTES de migrar):  pg_dump ... > backup.sql   /   psql ... < backup.sql
```

> Recomendado: `pg_dump` del volumen antes de cada `migrate deploy`.

## 7. Checklist de verificación post-deploy

```bash
# Salud y readiness (DB)
curl -i https://<tu-dominio>/api/health     # 200 {"status":"ok"}
curl -i https://<tu-dominio>/api/ready      # 200 {"status":"ready","database":"ok"}

# Límite de eventos (nunca ilimitado)
curl -s "https://<tu-dominio>/api/events?limit=999" | head -c 200   # array, máx 50

# HTTPS forzado (http → https)
curl -sI http://<tu-dominio>/api/health | grep -i location
```

- [ ] `https://<dominio>/api/health` → 200 y `https://<dominio>/api/ready` → 200.
- [ ] HTTP redirige a HTTPS (Force SSL en NPM).
- [ ] `nmap`/`ss` desde fuera: **solo 80/443** abiertos; `3000` y `5432` **no** accesibles públicamente.
- [ ] El contenedor backend corre como `node` (no root): `docker compose -f compose.prod.yaml exec backend id`.
- [ ] El frontend solo llama a `https://<dominio>/api` (revisar Network del navegador).
- [ ] Logs sin secretos (`docker compose -f compose.prod.yaml logs backend`).

Ver también: [checklist de seguridad pre-deploy](../security/predeploy-checklist.md) · [docker-backend.md](../docker-backend.md).
