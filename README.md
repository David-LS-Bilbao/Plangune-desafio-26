<p align="center">
  <img src="./frontend/src/assets/logo.svg" alt="Plangune logo" width="180" />
</p>


Web/demo pública: https://plangune.davlos.es/  
Repositorio: https://github.com/David-LS-Bilbao/Plangune-desafio-26.git

## Descripción

`PlanGune` es una web/app responsive, mobile-first, orientada a familias con bebés y niños pequeños en Euskadi. Su objetivo es ayudar a encontrar planes, actividades, eventos y negocios familiares con información útil para decidir con rapidez: edad recomendada, accesibilidad, si es interior, comodidad para carrito, servicios disponibles y contexto familiar.

Por la naturaleza del producto, puede manejar datos sensibles relacionados con menores. La seguridad y la prudencia en el tratamiento de datos son requisitos de base.

## Estado actual

El proyecto está en desarrollo activo y ya dispone de una base funcional sobre monorepo.

Estado técnico actual:

- `frontend/` con React + Vite
- `backend/` con Node.js + Express
- PostgreSQL + Prisma en uso en el backend
- tests automatizados en frontend y backend
- API REST bajo `/api`
- autenticación mínima con roles
- recomendaciones familiares con backend principal en Express y posibilidad de integración con servicios auxiliares
- playground visual del asistente familiar GUNI en entorno de desarrollo

## Enlaces

- Repositorio: https://github.com/David-LS-Bilbao/Plangune-desafio-26.git
- Web/demo pública: https://plangune.davlos.es/

## Estructura real del repositorio

```txt
desafio-26/
├── frontend/      # Cliente React + Vite
├── backend/       # API REST Express + Prisma + PostgreSQL
├── docs/          # Documentación técnica, IA, features, despliegue y calidad
├── ai-service/    # Servicio local opcional para demo del asistente LLM
├── data/          # Servicios y datasets auxiliares de datos/recomendación
├── compose.yaml
├── compose.prod.yaml
├── package.json
└── README.md
```

## Stack técnico

### Frontend

- React
- Vite
- React Router
- CSS
- Vitest + Testing Library
- i18n

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT en cookie `httpOnly`
- Vitest + Supertest

### Servicios auxiliares

- `ai-service/`: servicio local opcional para asistente LLM
- `data/`: utilidades y servicios Python relacionados con recomendación y datos

## Monorepo y workspaces

El repositorio usa npm workspaces en la raíz.

Workspaces actuales:

- `frontend`
- `backend`

Scripts principales en raíz:

```bash
npm install
npm run dev:backend
npm run dev:frontend
npm test
npm run test:backend
npm run test:frontend
```

## Descarga e instalación

Clonar el repositorio:

```bash
git clone https://github.com/David-LS-Bilbao/Plangune-desafio-26.git
cd Plangune-desafio-26
npm install
```

## Arranque local

### Requisitos

- Node.js 18 o superior
- npm
- PostgreSQL disponible
- variables de entorno configuradas

### Desarrollo

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

URLs locales por defecto:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3000`

## Base de datos y Prisma

El backend usa PostgreSQL con Prisma.

Comandos principales:

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:studio --workspace backend
npm run prisma:format --workspace backend
npm run db:seed --workspace backend
```

## Variables de entorno

### Backend

Crear `backend/.env` a partir de `backend/.env.example`.

Variables habituales:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://desafio26:desafio26_dev_password@localhost:5434/desafio26_dev?schema=public
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Variables opcionales para recomendación externa:

```env
DATA_RECOMMENDER_ENABLED=false
DATA_API_URL=http://localhost:5000
DATA_API_TIMEOUT_MS=2000
```

Variables opcionales para asistente LLM:

```env
LLM_ASSISTANT_ENABLED=false
LLM_ASSISTANT_API_URL=http://localhost:5001
LLM_ASSISTANT_TIMEOUT_MS=8000
LLM_ASSISTANT_CONTRACT=get-question
```

### Frontend

Crear `frontend/.env` a partir de `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:3000/api
```

## Backend actual

El backend Express expone la API pública bajo `/api`.

Rutas principales implementadas:

```txt
GET    /api/health
GET    /api/ready

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/activities
GET    /api/activities/:id

GET    /api/events
POST   /api/events
GET    /api/events/business/mine
GET    /api/events/:id

GET    /api/recommendations

GET    /api/reviews
POST   /api/reviews

POST   /api/incidents

GET    /api/favorites
POST   /api/favorites/:activityId
DELETE /api/favorites/:activityId

POST   /api/assistant/family-plan

GET    /api/admin/dashboard
GET    /api/admin/businesses/pending
PATCH  /api/admin/businesses/:id/approve
PATCH  /api/admin/businesses/:id/reject
GET    /api/admin/events/pending
PATCH  /api/admin/events/:id/approve
PATCH  /api/admin/events/:id/reject
```

Notas importantes:

- el frontend consume siempre el backend Express
- el frontend no llama directamente a `ai-service` ni a servicios de `data`
- `/api/favorites` requiere autenticación y rol `family`
- la autenticación usa cookie `httpOnly`

## Frontend actual

La aplicación frontend incluye rutas públicas, familiares, de negocio y de administración.

Rutas destacadas:

- `/`
- `/login`
- `/register`
- `/crear-familia`
- `/crear-negocio`
- `/ofertas`
- `/planes`
- `/planes/:id`
- `/favoritos`
- `/perfil`
- `/buscar`
- `/negocio`
- `/admin`

Ruta de desarrollo:

- `/dev/family-chat` solo en entorno `DEV`

## GUNI y asistente familiar

El frontend incluye un playground visual aislado para el asistente familiar GUNI.

Características:

- disponible solo en desarrollo
- consume `POST /api/assistant/family-plan`
- usa `VITE_API_URL`
- degrada con fallback controlado si la IA no está disponible

Servicio relacionado:

- `ai-service/` corre localmente en `http://localhost:5001` cuando se activa

## Testing

Tests disponibles desde el inicio.

Comandos:

```bash
npm test
npm run test:backend
npm run test:frontend
```

## Docker y despliegue

El repositorio incluye archivos de Docker Compose para desarrollo y producción:

- `compose.yaml`
- `compose.prod.yaml`
- `compose.data.prod.yaml`
- `compose.local-override.yaml`

La web pública está desplegada en:

```txt
https://plangune.davlos.es/
```

El despliegue de demo/producción está documentado en:

- `docs/deployment/vps-demo-deploy.md`
- `docs/security/predeploy-checklist.md`

La arquitectura de servidor usa Docker Compose detrás de Nginx Proxy Manager. Solo deben exponerse públicamente los puertos `80` y `443`; PostgreSQL y servicios internos no deben exponerse a Internet.

Antes de desplegar o modificar producción, revisar la configuración:

```bash
docker compose -f compose.prod.yaml config
```

No ejecutar despliegue sin completar el checklist de seguridad y sin configurar los secretos reales fuera del repositorio.

## Documentación relacionada

Referencias útiles del repo:

- `docs/api.md`
- `docs/database.md`
- `docs/security.md`
- `docs/quality/README.md`
- `docs/contracts/frontend-backend-api-contract.md`
- `docs/features/`
- `docs/ai/AGENT_WORKFLOW.md`
- `docs/ai/GIT_BRANCHING_POLICY.md`
- `docs/ai/AGENT_RULES.md`

## Reglas de trabajo

Para trabajo de agentes y colaboración técnica, la fuente de verdad operativa es:

- `AGENTS.md`

Puntos clave:

- no trabajar directamente sobre `main`, `dev`, `frontend` ni `backend`
- no hacer `commit`, `push`, `merge`, `rebase`, `reset` o `clean` sin confirmación humana
- no usar `git add .` ni `git add -A`
- no versionar secretos ni `.env`

## Alcance y roadmap

Este repositorio ya contiene piezas funcionales, pero no todo el producto final está cerrado.

Fuera de alcance como producto final estable:

- naming comercial definitivo
- cierre visual final
- expansión completa de dashboards
- alcance completo de negocio y admin
- features avanzadas fuera del MVP

## Seguridad

Principios mínimos:

- no almacenar secretos en el repo
- usar `.env.example` como referencia
- proteger rutas con autenticación y rol
- prudencia máxima con datos relacionados con menores
- revisar checklist de predeploy antes de cualquier exposición pública

## Licencia

Pendiente de definir.
