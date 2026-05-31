# SKILL · API Express con MVC

Convenciones de backend para DESAFIO-26 (Express, ESM, MVC, API REST).

## Arranque

- `src/app.js` exporta `createApp()` (factory, sin abrir puerto) → testeable con supertest.
- `src/server.js` carga `.env`, conecta DB (si hay `MONGODB_URI`) y abre el puerto.

## Middlewares base (ya configurados)

`helmet`, `cors`, `express.json`, `express.urlencoded`, `morgan` (silenciado en tests).

## Capas

```txt
routes/index.js → routes/<recurso>.routes.js → controllers/ → services/ → models/
```

- **routes**: solo enrutan; no contienen lógica.
- **controllers**: leen `req`, llaman a services, devuelven `res`.
- **services**: lógica de negocio pura (sin `req`/`res`).
- **models**: esquemas Mongoose.

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
