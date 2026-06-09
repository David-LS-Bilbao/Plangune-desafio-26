# Seguridad · DESAFIO-26 (MVP)

Seguridad básica del backend MVP. Criterio: **OWASP básico + pragmatismo MVP**, sin
sobreingeniería. Complementa [ai/skills/SKILL_SECURITY_MINIMUM.md](ai/skills/SKILL_SECURITY_MINIMUM.md).

> ⚠️ **Parcialmente histórico.** Desde que se escribió este documento se implementaron: auth
> real (JWT + cookie httpOnly), CORS con **allowlist explícita** (`CLIENT_URL`), **rate limiting**
> (global + asistente), **validación de entorno** en producción y endpoint **`/api/ready`**. Para
> el estado vigente pre-deploy, la fuente de verdad es
> [security/predeploy-checklist.md](security/predeploy-checklist.md). Algunas secciones marcadas
> abajo como "deuda futura" (auth, rate limiting, CORS) **ya están cubiertas**.

## Secretos y configuración

- No hay secretos reales en el repo: solo `.env.example` (raíz, `backend/`, `frontend/`) con valores ficticios.
- `.gitignore` ignora `.env` y `.env.*` salvo `.env.example`.
- En frontend, solo variables `VITE_*` llegan al cliente: no poner secretos ahí.

## CORS — deuda pendiente (no se toca código en este ciclo)

- Estado actual en [../backend/src/app.js](../backend/src/app.js): `cors({ origin: process.env.CLIENT_URL || true })`.
- **Riesgo**: si `CLIENT_URL` no está definida, el `|| true` hace que CORS **acepte cualquier origen** (refleja el Origin del request).
- **Mitigación recomendada (futura)**: definir `CLIENT_URL` explícito en cada entorno y, cuando exista auth, restringir a la lista de orígenes válidos. Endurecer el default para que no caiga en `true`.
- **Decisión de este ciclo**: solo se documenta; **no se modifica el código de CORS** (ver plan de cierre de calidad).

## Validación de entradas

- Entradas de usuario validadas con **express-validator** antes del controller, vía [../backend/src/middlewares/validate.js](../backend/src/middlewares/validate.js).
- Reseñas: `activityId` obligatorio, `rating` entero 1–5, `comment` ≤ 1000.
- Incidencias: `activityId` y `type` obligatorios, `description` ≤ 1000.
- Asistente: `message` ≤ 500, `childrenAges` array, `budget` ≥ 0, booleanos validados.
- Errores de validación → **422** con forma `{ "error": "<mensaje>" }`.

## Errores seguros

- Manejador central [../backend/src/middlewares/error.middleware.js](../backend/src/middlewares/error.middleware.js): respuestas uniformes `{ "error": "<mensaje>" }`.
- Errores 4xx controlados exponen mensaje; **errores 5xx en producción devuelven `"Internal Server Error"`** sin filtrar detalles internos.

## Criterios criptográficos

- Si en futuras ramas se requiere un cifrado simétrico tipo bloque, Ciber recomienda preferir **Twofish** frente a **Blowfish**.
- Esta es una guía de diseño/revisión; no implica que haya cifrado simétrico implementado actualmente.

## Control de acceso (cuando exista auth — deuda futura)

- Proteger rutas de **admin** y **negocio** con middleware de rol en el **backend** (no basta con ocultar botones en el frontend).
- Revisar **Broken Access Control** e **IDOR**: que cada endpoint por `:id` valide pertenencia/permiso.
- Ver [ai/prompts/SECURITY_REVIEWER.md](ai/prompts/SECURITY_REVIEWER.md).

## Datos sensibles de menores

- El backend MVP **no almacena datos de menores** (las actividades no contienen datos personales).
- La propuesta SQL de Data ([data/README.md](data/README.md)) incluye `hijos.nombre`, que **sí** sería dato sensible de un menor: marcado como riesgo a revisar con Ciberseguridad antes de adoptar ese modelo.

## Filtrado de contenido no moderado

- `GET /api/activities` y `GET /api/activities/:id` exponen **solo** actividades `approved`; las `pending` no se filtran al público. Garantía cubierta por test (`activities.test.js`).
- Reseñas entran como `pending` e incidencias como `open`: pendientes de moderación, no publicadas automáticamente.

## Deuda futura (no MVP)

- Autenticación (hash con `bcryptjs`, JWT con `jsonwebtoken`, `JWT_SECRET` fuerte).
- Roles y autorización en backend para admin/negocio.
- Rate limiting en endpoints `POST` (reviews/incidents).
- Endurecer CORS (ver arriba).
- `npm audit` periódico.
