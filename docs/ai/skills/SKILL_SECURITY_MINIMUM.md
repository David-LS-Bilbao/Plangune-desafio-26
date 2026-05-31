# SKILL · Seguridad mínima

Medidas de seguridad base para DESAFIO-26. Objetivo: no introducir agujeros obvios desde el bootstrap.

## Secretos y configuración

- **Nunca** commitear `.env` ni secretos. Solo `.env.example` con valores ficticios.
- `.gitignore` ya ignora `.env` y `.env.*` (salvo `.env.example`).
- En el frontend, solo las variables `VITE_*` llegan al cliente: no poner secretos ahí.

## Backend (ya configurado)

- `helmet` para cabeceras de seguridad.
- `cors` restringible vía `CLIENT_URL`.
- `express.json` con límite por defecto (ajustar si se suben payloads grandes).

## Cuando se implemente auth (futuro)

- Hash de contraseñas con `bcryptjs` (nunca guardar contraseñas en claro).
- Tokens JWT con `jsonwebtoken`, secreto fuerte en `JWT_SECRET`, expiración corta.
- Proteger rutas admin con middleware de rol.

## Validación y saneo

- Validar **todas** las entradas de usuario con `express-validator`.
- Sanear contenido generado por usuarios (reseñas, descripciones) antes de mostrarlo.

## Datos sensibles

- No almacenar nombres reales, fotos ni datos sensibles de menores.
- Minimizar datos personales: guardar solo lo necesario.

## Buenas prácticas adicionales

- Devolver mensajes de error genéricos al cliente (sin filtrar detalles internos).
- Considerar rate limiting en endpoints sensibles si hay tiempo.
- Mantener dependencias actualizadas; revisar `npm audit` periódicamente.

> En el bootstrap aún no hay auth ni roles: estas reglas guían las próximas ramas.
