# Checklist de seguridad pre-deploy · DESAFIO-26 / pLANGUNE

Verificar **antes** de desplegar la demo en VPS público. Complementa
[deployment/vps-demo-deploy.md](../deployment/vps-demo-deploy.md) y
[../security.md](../security.md).

> Estado a fecha de auditoría pre-merge: los puntos marcados ✅ están implementados y
> verificados (tests + runtime en contenedor); los ⏳ dependen de la configuración del VPS.

## Secretos y configuración

- [x] ✅ **No hay `.env` reales versionados** — solo `.env.example` (raíz, `backend/`, `frontend/`); `backend/.env` y `frontend/.env` están gitignored.
- [x] ✅ **Sin secretos en código/docs** (`git grep` de `JWT_SECRET=|DATABASE_URL=|PASSWORD=|API_KEY=…` limpio fuera de examples).
- [ ] ⏳ `JWT_SECRET` **fuerte** (≥32 chars aleatorios, sin placeholder) en `.env.production` del host.
- [ ] ⏳ `DATABASE_URL` real **fuera del repo** (host/Docker), apuntando al servicio `postgres` interno.
- [ ] ⏳ `CLIENT_URL` = **dominio real** (`https://<dominio>`), no `localhost`.
- [ ] ⏳ `CLOUD_ASSISTANT_API_KEY` (si se usa GUNI cloud) solo en backend; **nunca** en `VITE_*`.

## Runtime backend

- [x] ✅ **Validación de entorno**: en `production` no arranca sin `DATABASE_URL`/`JWT_SECRET`/`CLIENT_URL` o con `JWT_SECRET` débil ([`config/env.js`](../../backend/src/config/env.js)).
- [ ] ⏳ `NODE_ENV=production`.
- [ ] ⏳ `TRUST_PROXY=1` (detrás de Nginx Proxy Manager → IP real para rate limit / logs).
- [x] ✅ **Rate limit global** `/api` (120/min por IP) — [`rateLimit.middleware.js`](../../backend/src/middlewares/rateLimit.middleware.js).
- [x] ✅ **Rate limit del asistente** `/api/assistant/family-plan` (10/min por IP).
- [x] ✅ **`/api/ready`** consulta PostgreSQL real (`SELECT 1`); 503 si la DB no responde.
- [x] ✅ **`/api/events` con límite duro** (`page`/`limit`, máx **50**; nunca ilimitado).
- [x] ✅ **Errores seguros**: 5xx en producción → `Internal Server Error`; errores de Prisma enmascarados; **sin stacktrace** al cliente ([`error.middleware.js`](../../backend/src/middlewares/error.middleware.js)).
- [x] ✅ **Sin rutas admin/internal expuestas** (solo `/api/{health,ready,auth,activities,assistant,events,favorites,incidents,recommendations,reviews}`).

## Docker / red

- [x] ✅ **Backend no-root** (`USER node`) y **no copia `.env`** (excluido en `.dockerignore`).
- [x] ✅ **`compose.prod.yaml` sin `ports` públicos** (solo `expose`); imágenes con **versión concreta** (no `latest`).
- [ ] ⏳ **PostgreSQL sin puerto público**, en red Docker **interna** (`plangune_internal`, `internal: true`).
- [ ] ⏳ Solo **80/443** públicos en el VPS (verificar con `ss`/`ufw`/`nmap`).
- [ ] ⏳ **Ollama / Flask-Data / Redis / Postgres NO expuestos** a Internet.
- [ ] 🔶 (Opcional, recomendado) `cap_drop: [ALL]` + `security_opt: [no-new-privileges]` en `compose.prod.yaml`.

## Nginx Proxy Manager / HTTPS

- [ ] ⏳ Proxy Host → `backend:3000` con **SSL Let's Encrypt + Force SSL + HTTP/2**.
- [ ] ⏳ HTTP redirige a HTTPS.
- [ ] ⏳ **Headers** (helmet ya añade CSP, HSTS, X-Content-Type-Options, Referrer-Policy, etc.; verificar tras NPM):
  - `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.

## Datos y logs

- [x] ✅ Frontend **no** llama a PostgreSQL/Flask/Ollama/Data directamente: solo `apiClient` → `/api` (`VITE_API_URL`).
- [x] ✅ Token de sesión en **cookie httpOnly** (no en `localStorage`/`sessionStorage`).
- [ ] ⏳ **Logs sin secretos** (revisar `docker compose logs`; el handler de errores ya no filtra internals).
- [ ] ⏳ Datos sensibles de menores: el backend actual no los almacena; revisar antes de añadir `hijos.nombre` (ver [../security.md](../security.md)).

## Post-deploy (smoke test)

- [ ] `curl https://<dominio>/api/health` → 200 · `…/api/ready` → 200.
- [ ] `…/api/events?limit=999` → array, longitud ≤ 50.
- [ ] `nmap <dominio>` → solo 80/443.
- [ ] `docker compose -f compose.prod.yaml exec backend id` → `uid=…(node)`.
