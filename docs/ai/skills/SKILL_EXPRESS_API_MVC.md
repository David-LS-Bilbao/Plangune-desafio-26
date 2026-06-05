# SKILL · API Express con MVC

Convenciones de backend para DESAFIO-26 (Express, ESM, MVC, API REST).

> **Contrato API:** cualquier tarea backend que consuma o modifique API debe consultar
> [../../contracts/frontend-backend-api-contract.md](../../contracts/frontend-backend-api-contract.md)
> **antes de tocar código**. Ver también [SKILL_FRONTEND_BACKEND_CONTRACT.md](SKILL_FRONTEND_BACKEND_CONTRACT.md).

## Arranque

- `src/app.js` exporta `createApp()` (factory, sin abrir puerto) → testeable con supertest.
- `src/server.js` carga `.env` y abre el puerto. La conexión a PostgreSQL (Prisma) es perezosa vía `src/config/prisma.js`, por lo que el healthcheck no requiere DB.

## Middlewares base (ya configurados)

`helmet`, `cors`, `express.json`, `express.urlencoded`, `morgan` (silenciado en tests).

## Capas

```txt
routes/index.js → routes/<recurso>.routes.js → controllers/ → services/ → models/
```

- **routes**: solo enrutan; no contienen lógica.
- **controllers**: leen `req`, llaman a services, devuelven `res`.
- **services**: lógica de negocio pura (sin `req`/`res`).
- **models**: modelos de datos definidos en `prisma/schema.prisma` (Prisma + PostgreSQL).

## Convención REST

```txt
GET    /api/<recurso>           listar
GET    /api/<recurso>/:id       detalle
POST   /api/<recurso>           crear
PUT    /api/<recurso>/:id       actualizar
DELETE /api/<recurso>/:id       borrar
```

## Validación

Usar `express-validator` en la capa de rutas/middleware antes del controller.

```js
import { body, validationResult } from 'express-validator';
```

## Manejo de errores

- Controllers devuelven códigos HTTP correctos (`200`, `201`, `400`, `401`, `404`, `500`).
- Hay un 404 por defecto en `app.js`. Un middleware de errores central se añadirá cuando haga falta.

## No romper el contrato

- **No cambiar el shape de respuesta** ni renombrar endpoints sin actualizar
  [el contrato](../../contracts/frontend-backend-api-contract.md) y `docs/api.md` en el mismo PR.
- **Mantener los alias legacy**: `activity` (alias de `event` en recomendaciones) y `activityId`
  (ruta pública de favoritos; `eventId` es la clave canónica). No retirarlos sin plan acordado.
- **Respetar los `source`/`mode` reales** y no inventar campos (el asistente IA usa
  `assistantMessageMarkdown`, no `assistantMessage`).
- Cualquier cambio de contrato lleva **test o mock** que lo proteja.

## Healthcheck (referencia actual)

```http
GET /api/health  →  200 { "status": "ok", "service": "DESAFIO-26 API" }
```

## Test (patrón)

```js
import request from 'supertest';
import { createApp } from '../app.js';

const res = await request(createApp()).get('/api/health');
expect(res.status).toBe(200);
```
