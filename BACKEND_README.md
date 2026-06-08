# Backend DESAFIO-26 · Implementación MVP

## ✅ Qué se ha hecho

El backend está **funcional sobre PostgreSQL (Prisma)**, con arquitectura MVC
(`routes → controllers → services → repositories`):

- ✅ **Persistencia real**: el acceso a datos va por Prisma/PostgreSQL
  (`event.repository.js`, `favorite.repository.js`). No hay fallback en memoria
  en runtime; el servidor necesita `DATABASE_URL`.
- ✅ **Repository Event**: filtra eventos (municipio, territorio, categoria,
  tipo_evento, edad, es_interior, es_carrito, es_cambiador, rango de fechas).
- ✅ **Service Event**: serializa decimales/fechas (Prisma → JSON) y valida por ID.
- ✅ **Recomendaciones** (`/api/recommendations`): usa la **Data API** (Flask del
  equipo Data) cuando está habilitada; si está deshabilitada o falla, cae al
  **recomendador local determinista** (Family Score) sobre Prisma.
- ✅ **Favoritos** (`/api/favorites`): persistidos en PostgreSQL.
- ✅ **Mocks**: solo para **seed** (`backend/prisma/seed.js` carga datos demo) y
  **tests** (Vitest). No se usan en el camino de ejecución normal.

> Otros routers montados: `health`, `activity`, `assistant`, `incident`,
> `review`. Ver `backend/src/routes/`.

## 🚀 Cómo ejecutar

### Backend (Express)

```bash
cd backend
npm install
npm run dev
```

El servidor escucha en **http://localhost:3000**. Requiere una PostgreSQL
accesible vía `DATABASE_URL` (ver `compose.yaml` para levantarla con Docker).

### Endpoints disponibles

#### **Health Check**
```bash
GET /api/health
# Responde { status: "ok", service: "DESAFIO-26 API" }
```

#### **Listar Eventos**
```bash
GET /api/events?municipio=Bilbao&es_carrito=true&edad=3
# Filtros opcionales:
#   - municipio, territorio, categoria, tipo_evento (string, case-insensitive)
#   - es_interior, es_carrito, es_cambiador (boolean)
#   - edad (number, devuelve si edad_minima <= edad)
#   - fecha_desde, fecha_hasta (ISO 8601)
```

#### **Obtener Evento por ID**
```bash
GET /api/events/1
# Devuelve 404 si no existe
```

#### **Recomendaciones Personalizadas**
```bash
GET /api/recommendations?childrenAges=3,5&strollerFriendly=true&municipality=Bilbao&limit=3
# Filtros opcionales:
#   - childrenAges (comma-separated: "3,5")
#   - strollerFriendly (boolean)
#   - rainSuitable (boolean)
#   - budget (number)
#   - municipality (string)
#   - limit (number, default 3)
#
# Devuelve array de items: { event, activity (alias legacy), score, reasons[], source }
#   - source = "data-api"        → respondió la Data API
#   - source = "local-fallback"  → recomendador local (Data deshabilitada o caída)
```

#### **Favoritos**
```bash
# Persistidos en PostgreSQL (tabla user_favorite_events).
GET    /api/favorites          # lista los favoritos
POST   /api/favorites          # añade un favorito
DELETE /api/favorites/:eventId # elimina un favorito
```

## 📊 Ejemplo de respuesta (evento)

```json
{
  "id": 1,
  "title": "Guggenheim Txiki",
  "municipio": "Bilbao",
  "categoria": "Museos",
  "es_interior": true,
  "es_carrito": true,
  "es_cambiador": true,
  "edad_minima": 4,
  "fecha_inicio": "2026-06-05T09:00:00.000Z",
  "price": "Desde 12€",
  "imagen_url": "https://...",
  "...": "..."
}
```

## 🧠 Arquitectura

```
Request
  ↓
Controller (parsea query string)
  ↓
Service (lógica de negocio, serializa tipos)
  ↓
Repository (Prisma)
  ↓
PostgreSQL
```

### Recomendador: Data API + fallback local

`/api/recommendations` intenta primero la **Data API** (si
`DATA_RECOMMENDER_ENABLED=true`). Si está deshabilitada, falla, da timeout o
devuelve vacío, usa el **recomendador local determinista** (Family Score):

- Base: 50 puntos
- +20 si edad apta (edad_minima <= min(childrenAges))
- +10 si carrito disponible (strollerFriendly && es_carrito)
- +10 si cubierto (rainSuitable && es_interior)
- +10 si dentro de presupuesto (precio conocido y <= budget; precio
  desconocido **no** cuenta como gratis)
- +10 si municipio coincide
- **Max: 100 puntos**

Cada recomendación incluye `reasons[]` (strings explicativos) y `source`.

## 🛢️ Datos

La fuente de verdad del esquema es **Prisma** (`backend/prisma/schema.prisma`) y
sus **migraciones**. Como referencia documental del esquema acordado con Data se
mantiene `docs/data/schema-real/init.sql`.

Los datos demo para desarrollo se cargan con el **seed**
(`backend/prisma/seed.js`, a partir de `backend/src/seed/mockEvents.js`).

## ⚙️ Variables de entorno (.env)

Plantilla completa en `backend/.env.example`. Resumen:

```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://desafio26:desafio26_dev_password@localhost:5432/desafio26_dev?schema=public"
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173

# Data Recommender (Flask del equipo Data). Por defecto deshabilitado.
DATA_RECOMMENDER_ENABLED=false
DATA_API_URL=http://localhost:5000
DATA_API_TIMEOUT_MS=2000

# Asistente LLM local (ai-service Flask, puerto 5001). Por defecto deshabilitado.
LLM_ASSISTANT_ENABLED=false
LLM_ASSISTANT_API_URL=http://localhost:5001
LLM_ASSISTANT_TIMEOUT_MS=8000

LOG_LEVEL=info
```

## 🔄 Puesta en marcha de la base de datos

1. Levanta PostgreSQL (local o `docker compose up -d postgres`).
2. Rellena `DATABASE_URL` en `.env` (alineado con `compose.yaml`).
3. `npm run prisma:migrate --workspace backend` (crea tablas desde `schema.prisma`).
4. Seed de datos demo: `npm run db:seed --workspace backend`.

## 🎯 Estructura de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma         # Fuente de verdad del esquema
│   ├── migrations/           # Migraciones Prisma
│   └── seed.js               # Seed de datos demo
├── src/
│   ├── seed/                 # mockEvents.js (datos demo para seed/tests)
│   ├── repositories/         # event/favorite.repository.js (acceso Prisma)
│   ├── services/             # lógica de negocio + serialización
│   ├── controllers/          # parseo de request y respuesta
│   ├── routes/               # routers montados en /api
│   ├── clients/              # dataRecommender.client.js (Data API)
│   ├── middlewares/          # error.middleware.js, validate.js
│   ├── utils/                # asyncHandler.js, serializeEvent.js
│   ├── config/               # prisma.js (cliente Prisma)
│   ├── app.js                # Express factory
│   └── server.js             # Punto de entrada
├── .env.example              # Plantilla de entorno
└── package.json
```

## 💡 Principios aplicados

- **Funciones atómicas**: cada función hace una cosa bien.
- **Repository pattern**: acceso a datos centralizado en Prisma.
- **Serialización centralizada**: tipos JSON estables (`serializeEvent`).
- **Error handling uniforme**: middleware de errores.
- **Recomendador explicable**: determinista, con `reasons[]`, como fallback de Data.

## ✨ Notas

- Sin autenticación aún (futuro: JWT en routes protegidas).
- Validación de entrada con `validate.js` donde aplica.
- El recomendador local es determinista (explicable), sin IA.
- Integración con la Data API lista; deshabilitada por defecto hasta dockerizar Data.
