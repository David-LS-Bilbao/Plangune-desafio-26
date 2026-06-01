# SKILL · Bootstrap del monorepo (React + Express + PostgreSQL) con MVC

Cómo está montado el monorepo DESAFIO-26 y cómo extenderlo.

> **Nota legacy (pendiente de renombrar):** el nombre del archivo conserva "MERN" por motivos históricos, pero el stack **no es MERN**: la base de datos es **PostgreSQL con Prisma**, no MongoDB (decisión de equipo; MongoDB/Mongoose se descartó). No se renombra el archivo en este ciclo para no romper enlaces; renombrarlo a `SKILL_MONOREPO_MVC_BOOTSTRAP.md` queda como tarea futura.

## Estructura del monorepo

```txt
desafio-26/
├── package.json          # workspaces: ["frontend", "backend"]
├── frontend/             # React + Vite (JS)
├── backend/              # Express + Prisma/PostgreSQL (MVC)
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
request → routes → controllers → services → models (Prisma) → PostgreSQL
```

- **routes/**: definen endpoints y delegan en controllers.
- **controllers/**: orquestan la petición/respuesta HTTP.
- **services/**: lógica de negocio reutilizable (sin Express).
- **models/**: acceso a datos vía Prisma; el esquema vive en `prisma/schema.prisma`.
- **middlewares/**: auth, validación, manejo de errores.
- **config/**: conexión a DB y configuración.
- **utils/**, **seed/**, **tests/**: soporte.

## Cómo añadir un recurso nuevo (patrón)

1. Define el modelo en `prisma/schema.prisma` y aplica con `npm run prisma:migrate --workspace backend`.
2. `services/<recurso>.service.js` — lógica (usa el cliente Prisma de `src/config/prisma.js`).
3. `controllers/<recurso>.controller.js` — handlers HTTP.
4. `routes/<recurso>.routes.js` — endpoints, montados en `routes/index.js`.
5. `tests/<recurso>.test.js` — test con supertest.

## Estado actual (bootstrap)

Solo existe el healthcheck (`GET /api/health`). PostgreSQL/Prisma está preparado (cliente en `src/config/prisma.js`, schema en `prisma/schema.prisma`) pero sin modelos ni features.
