# Plangune Euskadi

> **Nombre provisional del proyecto.**
> El naming definitivo será definido más adelante por el equipo de Marketing.

## Descripción

Plangune Euskadi es una web/app responsive, mobile-first y SPA orientada a familias jóvenes con bebés y niños pequeños que buscan planes, lugares, actividades y negocios familiares en Euskadi de forma sencilla, segura y sin complicaciones.

El objetivo principal es ayudar a las familias a responder preguntas prácticas antes de salir de casa:

* ¿Es adecuado para la edad de mi peque?
* ¿Puedo ir con carrito?
* ¿Hay baño o cambiador?
* ¿Es un plan a cubierto si llueve?
* ¿Es tranquilo y cómodo?
* ¿Qué opinan otras familias?
* ¿Hay ofertas o actividades familiares cerca?

Este proyecto se desarrolla dentro del **Desafío de Tripulaciones 2026**.

---

## Estado del proyecto

Proyecto en desarrollo del MVP. Producto y documentación inicial:

* Brief oficial del desafío.
* Investigación inicial de producto y competencia.
* Mocks UX/UI.
* Dosier preliminar de objetivos.
* Carpeta Drive organizada por verticales.
* Plan inicial de arquitectura Full Stack.

### Backend MVP

El backend Express expone la **API REST pública bajo `/api`**. El frontend consume siempre
Express; no llama directamente a servicios internos como la API Flask de Data.

Estado actual:

* `/api/events`, `/api/recommendations` y `/api/favorites` usan datos reales vía PostgreSQL/Prisma.
* `/api/recommendations` usa **Data Flask** como recomendador principal cuando
  `DATA_RECOMMENDER_ENABLED=true`.
* Si Data está deshabilitada, falla o agota timeout, Express usa el recomendador local
  Prisma/PostgreSQL como fallback.
* Existe un servicio local opcional [`ai-service/`](ai-service/) para demo del asistente LLM
  con Ollama. Corre en `http://localhost:5001` y Express lo consume desde
  `POST /api/assistant/family-plan`; el frontend no llama a Flask.
* Si `LLM_ASSISTANT_ENABLED=false` o el `ai-service` falla, Express mantiene el fallback local
  sin IA.
* El campo actual para planes interiores/a cubierto es `events.es_interior`.
* Existe una migración incremental segura para renombrar `es_lluvia` a `es_interior`.
* Tests backend actuales: **11 suites · 91/91 verdes**.
* PostgreSQL local usa `localhost:5434` desde el host para evitar conflictos con otros
  proyectos en `5432`; dentro de Docker el backend sigue usando `postgres:5432`.
* Existe un importador CSV seguro (`backend/prisma/import-events-from-csv.js`) para ampliar
  eventos con datos de Data bajo validación explícita. Ver [docs/database.md](docs/database.md).

Endpoints actuales:

* `GET /api/health`
* `GET /api/activities` · `GET /api/activities/:id` (solo `approved`)
* `GET /api/recommendations` (hasta 3 planes con Family Score reglado y explicable)
* `POST /api/assistant/family-plan` (LLM local opcional con fallback sin IA)
* `POST /api/reviews` · `POST /api/incidents`
* `GET/POST/DELETE /api/favorites`

Variables Data (`backend/.env.example`):

```bash
DATA_RECOMMENDER_ENABLED=false
DATA_API_URL=http://localhost:5000
DATA_API_TIMEOUT_MS=2000
```

Para activar Data en local:

* Windows/Linux: `DATA_API_URL=http://localhost:5000`.
* Mac: usar `DATA_API_URL=http://localhost:5050` si AirPlay/Control Center ocupa el puerto `5000`.

Data vive en el repo externo `Desafio-Data`. Express sigue siendo la única fachada pública para
frontend; el frontend nunca llama directamente a Data.

Variables LLM local (`backend/.env.example`):

```bash
LLM_ASSISTANT_ENABLED=false
LLM_ASSISTANT_API_URL=http://localhost:5001
LLM_ASSISTANT_TIMEOUT_MS=8000
LLM_ASSISTANT_CONTRACT=get-question
```

Con `LLM_ASSISTANT_CONTRACT=get-question`, Express consume el chatbot Data por contrato `GET
/<pregunta>` y mantiene fallback local si Data falla. Documentación completa:
[docs/integration-ai-ollama-local.md](docs/integration-ai-ollama-local.md).

Arranque y tests (monorepo npm workspaces):

```bash
npm install
npm run dev:backend     # API en http://localhost:3000
npm run prisma:generate --workspace backend
npm run prisma:migrate  --workspace backend
npm run db:seed         --workspace backend
npm run test:backend    # tests con Vitest + Supertest
```

Contrato detallado en [docs/api.md](docs/api.md) · base de datos y seed en [docs/database.md](docs/database.md) · seguridad en [docs/security.md](docs/security.md) · calidad y cobertura en [docs/quality/](docs/quality/).

---

## Público objetivo

Familias jóvenes, locales o visitantes, con bebés o niños pequeños, que buscan planes cómodos, seguros y bien planificados en Euskadi.

Especialmente familias que valoran:

* evitar improvisaciones;
* saber si un sitio es cómodo con carrito;
* filtrar por edad, clima, precio, zona y duración;
* consultar reseñas útiles de otras familias;
* encontrar lugares y actividades familiares sin perder tiempo.

---

## Propuesta de valor

**Planes familiares en Euskadi filtrados por edad, comodidad, ubicación y necesidades reales de las familias.**

La aplicación no pretende ser otro portal genérico de ocio, sino una herramienta práctica para decidir rápido qué hacer con peques.

---

## Roles principales

### Familia

Usuario final de la aplicación.

Funcionalidades previstas:

* registrarse e iniciar sesión;
* crear perfil familiar básico;
* buscar planes;
* filtrar por edad, zona, precio, interior/exterior, carrito, cambiador y duración;
* consultar detalle de planes;
* guardar favoritos;
* dejar reseñas;
* reportar incidencias.

### Negocio / Actividad

Comercios, entidades o profesionales que quieran publicar actividades, eventos, planes u ofertas familiares.

Funcionalidades previstas:

* registrarse como negocio;
* crear perfil de negocio;
* publicar actividades;
* crear ofertas o promociones;
* consultar estado de publicaciones;
* ver reseñas recibidas.

### Admin

Rol interno encargado de moderar y controlar la calidad del contenido.

Funcionalidades previstas:

* aprobar o rechazar actividades;
* moderar reseñas e incidencias;
* gestionar usuarios y negocios;
* revisar métricas básicas;
* mantener la calidad de los datos.

---

## MVP

El MVP se centra en construir una demo funcional, clara y defendible.

### Must have

* Landing inicial.
* Login y registro.
* Selección de rol: familia o negocio.
* Rol admin interno.
* Perfil familiar básico.
* Buscador de planes.
* Filtros familiares.
* Resultados en listado.
* Detalle de plan.
* Reseñas e incidencias.
* Alta de actividad por negocio.
* Alta de oferta por negocio.
* Panel admin para aprobar/rechazar contenido.
* Sistema de recomendación mediante **Family Score** reglado y explicable.

### Should have

* Favoritos.
* Vista mapa simple.
* Métricas básicas de negocio.
* Métricas básicas de admin.
* Moderación básica de reseñas.
* Sellos familiares propios.

### Could have

* Recomendación por clima.
* Itinerarios familiares.
* Multiidioma.
* QR para negocios.
* Notificaciones.

### Won’t have en MVP

* Pagos reales.
* Reservas reales.
* Chat en tiempo real.
* Red social completa.
* App móvil nativa.
* Marketplace complejo.
* IA generativa compleja.
* Machine Learning avanzado.

---

## Sellos familiares propuestos

La aplicación podrá usar sellos propios para ayudar a las familias a decidir rápido:

* **Carrito Friendly**
* **Plan a Cubierto**
* **Baño / Cambiador**
* **Ambiente Tranquilo**
* **Familia Verificada**

Estos sellos deberán ser asignados o validados por el equipo admin, por datos de negocio o por reseñas verificadas.

---

## Family Score

El recomendador inicial será un sistema de scoring simple y explicable.

No se plantea un modelo de Machine Learning complejo en la primera versión.

Ejemplo de variables para calcular el Family Score:

* edad recomendada;
* distancia o zona;
* interior/exterior;
* plan a cubierto;
* accesibilidad con carrito;
* baño o cambiador;
* duración;
* precio;
* valoración media;
* incidencias recientes;
* popularidad;
* fiabilidad del dato.

Ejemplo de explicación al usuario:

> Te recomendamos este plan porque es a cubierto, apto para carrito, adecuado para 0-3 años y tiene buenas valoraciones recientes.

---

## Stack técnico

### Frontend

* React
* Vite
* React Router
* CSS modular o sistema de estilos acordado por el equipo
* Diseño mobile-first

### Backend

* Node.js
* Express
* Arquitectura MVC práctica
* API REST
* Middlewares de autenticación y roles

### Base de datos

* PostgreSQL
* Prisma (ORM)

> Decisión de equipo: 
>  **de momento NO se usa MongoDB**. La base de datos actual es **PostgreSQL con Prisma**.

### Herramientas

* GitHub
* Git Flow simplificado
* Postman / Insomnia para pruebas de API
* Figma, Excalidraw o recursos UX/UI compartidos en Drive

---

## Arquitectura prevista

```txt
plangune-euskadi/
├── frontend/
├── backend/
├── docs/
├── README.md
├── .gitignore
└── package.json
```

### Backend

```txt
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── services/
│   ├── utils/
│   └── app.js
├── server.js
├── .env.example
└── package.json
```

### Frontend

```txt
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
└── package.json
```

---

## Modelos principales previstos

### User

Representa a cualquier usuario autenticado.

Campos mínimos:

* name
* email
* passwordHash
* role: family | business | admin
* status
* createdAt
* updatedAt

### FamilyProfile

Perfil familiar asociado a un usuario familia.

Campos mínimos:

* userId
* city
* childrenAgeRanges
* strollerNeeded
* preferredIndoor
* preferredBudget
* favoriteCategories

Nota: no se deben guardar nombres reales, fotos ni datos sensibles de menores.

### Business

Perfil de negocio o entidad.

Campos mínimos:

* ownerId
* name
* description
* category
* city
* address
* contactEmail
* status

### Activity

Plan, lugar, evento o actividad familiar.

Campos mínimos:

* businessId
* title
* description
* category
* city
* address
* location
* ageMin
* ageMax
* indoorOutdoor
* isCovered
* strollerFriendly
* hasChangingTable
* hasBathroom
* calmEnvironment
* priceType
* durationMinutes
* images
* status
* familyScore
* source

### Review

Reseña de una familia sobre una actividad.

Campos mínimos:

* userId
* activityId
* rating
* comment
* tags
* status

### Incident

Incidencia reportada por una familia.

Campos mínimos:

* userId
* activityId
* type
* description
* status

### Favorite

Actividad guardada por una familia.

Campos mínimos:

* userId
* activityId

### Offer

Oferta o promoción creada por un negocio.

Campos mínimos:

* businessId
* activityId
* title
* description
* conditions
* validFrom
* validTo
* status
* sponsoredTier

### RecommendationLog

Registro opcional para explicar recomendaciones.

Campos mínimos:

* userId
* activityId
* score
* reasons
* createdAt

---

## Endpoints previstos

### Auth

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Family

```txt
GET    /api/family/profile
POST   /api/family/profile
PUT    /api/family/profile
```

### Activities

```txt
GET    /api/activities
GET    /api/activities/:id
POST   /api/activities
PUT    /api/activities/:id
DELETE /api/activities/:id
```

### Reviews

```txt
GET    /api/activities/:id/reviews
POST   /api/activities/:id/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
```

### Incidents

```txt
POST   /api/activities/:id/incidents
GET    /api/admin/incidents
PATCH  /api/admin/incidents/:id/status
```

### Favorites

```txt
GET    /api/favorites
POST   /api/favorites/:activityId
DELETE /api/favorites/:activityId
```

### Business

```txt
GET    /api/business/me
POST   /api/business/profile
PUT    /api/business/profile
GET    /api/business/activities
GET    /api/business/offers
```

### Offers

```txt
POST   /api/offers
GET    /api/offers
GET    /api/offers/:id
PUT    /api/offers/:id
DELETE /api/offers/:id
```

### Admin

```txt
GET    /api/admin/dashboard
GET    /api/admin/activities/pending
PATCH  /api/admin/activities/:id/approve
PATCH  /api/admin/activities/:id/reject
GET    /api/admin/reviews
PATCH  /api/admin/reviews/:id/status
GET    /api/admin/users
```

### Recommendations

```txt
GET    /api/recommendations
GET    /api/recommendations/activity/:id/explanation
```

---

## Rutas frontend previstas

```txt
/
 /login
 /register
 /home
 /search
 /activities
 /activities/:id
 /family-profile
 /favorites
 /business
 /business/activities/new
 /business/offers/new
 /business/offers
 /admin
 /admin/activities
 /admin/reviews
 /admin/incidents
```

---

## Flujo principal de demo

### Familia

```txt
Landing
→ Registro/Login
→ Perfil familiar
→ Buscar planes
→ Aplicar filtros
→ Ver resultados
→ Ver detalle
→ Guardar favorito o dejar reseña/incidencia
```

### Negocio

```txt
Login como negocio
→ Panel negocio
→ Crear actividad
→ Crear oferta
→ Ver estado pendiente/aprobado
```

### Admin

```txt
Login admin
→ Panel admin
→ Revisar actividad pendiente
→ Aprobar o rechazar
→ Moderar reseñas/incidencias
```

---

## Instalación

Pendiente de cerrar durante el bootstrap técnico.

Estructura esperada:

```bash
git clone <url-del-repositorio>
cd plangune-euskadi
```

Instalar frontend:

```bash
cd frontend
npm install
npm run dev
```

Instalar backend:

```bash
cd backend
npm install
npm run dev
```

---

## Variables de entorno

### Backend

Crear archivo:

```txt
backend/.env
```

Basado en:

```txt
backend/.env.example
```

Variables previstas:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://desafio26:desafio26_dev_password@localhost:5434/desafio26_dev?schema=public
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend

Crear archivo:

```txt
frontend/.env
```

Basado en:

```txt
frontend/.env.example
```

Variables previstas:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Scripts previstos

### Backend

```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "seed": "node src/seed/index.js"
}
```

### Frontend

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## Flujo Git

Ramas principales:

```txt
main    → rama estable/final
dev     → rama de integración
feat/*  → nuevas funcionalidades
fix/*   → correcciones
docs/*  → documentación
test/*  → pruebas
```

Reglas:

* No trabajar directamente sobre `main`.
* Crear ramas desde `dev`.
* Pull Requests siempre hacia `dev`.
* Commits pequeños y descriptivos.
* No subir secretos.
* No usar `git add .` sin revisar antes.
* Probar antes de abrir PR.

Ejemplos de ramas iniciales:

```txt
feat/project-bootstrap
feat/frontend-shell
feat/backend-api-base
feat/auth-roles
feat/family-search
feat/activity-detail
feat/business-admin-flow
docs/project-documentation
```

Ejemplos de commits:

```txt
chore: initialize project structure
feat: add backend healthcheck
feat: add frontend shell layout
docs: add initial README
feat: add auth routes
feat: add activity model
```

---

## Documentación prevista

La carpeta `/docs` deberá contener progresivamente:

```txt
docs/
├── architecture.md
├── api.md
├── data-model.md
├── security.md
├── family-score.md
├── git-workflow.md
├── presentation-script.md
└── decisions.md
```

---

## Seguridad básica

Medidas mínimas previstas:

* Autenticación con JWT.
* Hash de contraseñas.
* Roles y permisos.
* Validación de inputs.
* Protección de rutas admin.
* Moderación de reseñas e incidencias.
* No almacenar datos sensibles de menores.
* No subir `.env` ni secretos al repositorio.
* Sanitización de contenido generado por usuarios.
* Rate limiting si da tiempo.

---

## Criterios de aceptación del MVP

El MVP será válido si permite demostrar:

* Una familia puede registrarse, buscar planes y ver detalles.
* La búsqueda permite filtros familiares útiles.
* Una actividad muestra información práctica: edad, precio, duración, carrito, cambiador, interior/exterior y valoración.
* Un negocio puede crear una actividad u oferta.
* Un admin puede aprobar o rechazar contenido.
* Existe un Family Score explicable.
* La app es responsive y usable en móvil.
* La solución está documentada.
* Cada vertical puede explicar su aportación.

---

## Equipo y verticales

Proyecto multidisciplinar con participación de:

* Full Stack
* Data Science
* Ciberseguridad
* Marketing Digital
* UX/UI

---

## Notas importantes

* El nombre **Plangune Euskadi** es provisional.
* Los mocks UX/UI son referencia visual, no código final obligatorio.
* Los archivos `code.html` de los mocks no deben condicionar la arquitectura final.
* Prioridad absoluta: MVP funcional antes que funcionalidades avanzadas.
* KISS: primero que funcione, luego se mejora.
* La demo final manda sobre las ideas secundarias.
