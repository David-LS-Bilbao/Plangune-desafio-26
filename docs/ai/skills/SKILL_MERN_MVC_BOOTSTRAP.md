# SKILL · Bootstrap MERN con MVC

Cómo está montado el monorepo DESAFIO-26 y cómo extenderlo.

## Estructura del monorepo

```txt
desafio-26/
├── package.json          # workspaces: ["frontend", "backend"]
├── frontend/             # React + Vite (JS)
├── backend/              # Express + Mongoose (MVC)
└── docs/
```

## npm workspaces

Desde la raíz, `npm install` instala dependencias de todos los paquetes. Scripts útiles:

```bash
npm run dev:backend
npm run dev:frontend
npm test                 # backend + frontend (--if-present)
```

Instalar una dependencia en un workspace concreto:

```bash
npm install <paquete> --workspace backend
npm install <paquete> --workspace frontend
```

## Capas del backend (MVC práctico)

```txt
request → routes → controllers → services → models (Mongoose) → MongoDB
```

- **routes/**: definen endpoints y delegan en controllers.
- **controllers/**: orquestan la petición/respuesta HTTP.
- **services/**: lógica de negocio reutilizable (sin Express).
- **models/**: esquemas Mongoose.
- **middlewares/**: auth, validación, manejo de errores.
- **config/**: conexión a DB y configuración.
- **utils/**, **seed/**, **tests/**: soporte.

## Cómo añadir un recurso nuevo (patrón)

1. `models/<recurso>.model.js` — esquema Mongoose.
2. `services/<recurso>.service.js` — lógica.
3. `controllers/<recurso>.controller.js` — handlers HTTP.
4. `routes/<recurso>.routes.js` — endpoints, montados en `routes/index.js`.
5. `tests/<recurso>.test.js` — test con supertest.

## Estado actual (bootstrap)

Solo existe el healthcheck (`GET /api/health`). MongoDB está preparado pero sin modelos ni features.
