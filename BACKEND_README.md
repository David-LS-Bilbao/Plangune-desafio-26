# Backend DESAFIO-26 · Implementación MVP

## ✅ Qué se ha hecho

El backend está **100% funcional** con:

- ✅ **Modelo Mock de Eventos**: 7 eventos en memoria con estructura compatible con init.sql
- ✅ **Repository Event**: Filtra eventos (municipio, territorio, categoria, tipo_evento, edad, es_interior, es_carrito, es_cambiador)
- ✅ **Service Event**: Serializa decimales/fechas y valida por ID
- ✅ **Service Recommendation**: Family Score atómico y simple (score 0-100, reasons explicadas)
- ✅ **Controllers**: Parsean query strings de forma limpia
- ✅ **Routes**: Montadas en `/api/events` y `/api/recommendations`
- ✅ **Fallback Mock**: Sin PostgreSQL/DATABASE_URL, todo funciona en memoria

## 🚀 Cómo ejecutar

### Backend (Express)

```bash
cd backend
npm install
npm run dev
```

El servidor escucha en **http://localhost:3000**

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
#   - es_interior, es_carrito, es_cambiador, es_silla_ruedas (boolean)
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
# Devuelve array con score (0-100) y reasons por evento
```

## 📊 Ejemplo de respuesta

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
  ...
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
Repository (busca eventos)
  ↓
Mock Events o Prisma/PostgreSQL
```

### Family Score (Recomendador)

- Base: 50 puntos
- +20 si edad apta (edad_minima <= min(childrenAges))
- +10 si carrito disponible (strollerFriendly && es_carrito)
- +10 si cubierto (rainSuitable && es_interior)
- +10 si dentro de presupuesto
- +10 si municipio coincide
- **Max: 100 puntos**

Cada recomendación incluye `reasons[]` (strings explicativos).

## 🛢️ Datos

Hay 7 eventos en memoria (/backend/src/models/mockEvents.js):

1. Guggenheim Txiki (Bilbao, museo)
2. Parque de Doña Casilda (Bilbao, parque)
3. Taller de Cerámica (Bilbao, taller)
4. Ruta Bosque de Oma (Kortezubi, naturaleza)
5. Restaurante TxokoKids (Getxo, restaurante)
6. Acuario de Getxo (Getxo, acuario)
7. Pintxos en la Ribera (Bilbao, gastronomía)

## ⚙️ Variables de entorno (.env)

```
PORT=3000
NODE_ENV=development
DATABASE_URL=                          # Si vacío, usa mock
JWT_SECRET=change_me_in_production
CLIENT_URL=http://localhost:5173
DATA_RECOMMENDER_ENABLED=false         # Futuro
DATA_API_URL=http://localhost:5000
DATA_API_TIMEOUT_MS=2000
LOG_LEVEL=info
```

## 🔄 Cómo pasar a PostgreSQL

1. Levanta PostgreSQL local o en Docker
2. Llena `DATABASE_URL` en `.env`
3. Ejecuta `npm run prisma:migrate` (crea tablas desde schema.prisma)
4. Seed con `npm run db:seed` (carga datos reales)

El repository cambiará automáticamente de mock a Prisma.

## 🎯 Estructura de carpetas

```
backend/
├── src/
│   ├── models/               # mockEvents.js (datos)
│   ├── repositories/         # event.repository.js (acceso a datos)
│   ├── services/             # event.service.js, recommendation.service.js (lógica)
│   ├── controllers/          # event.controller.js, recommendation.controller.js
│   ├── routes/               # index.js, event.routes.js, recommendation.routes.js
│   ├── middlewares/          # error.middleware.js, validate.js
│   ├── utils/                # asyncHandler.js, serializeEvent.js
│   ├── config/               # prisma.js (cliente Prisma)
│   ├── app.js                # Express factory
│   └── server.js             # Punto de entrada
├── .env                      # Variables de entorno
├── .env.example              # Plantilla
└── package.json
```

## 💡 Principios aplicados

- **Funciones atómicas**: Cada función hace UN cosa bien
- **Repository pattern**: Acceso a datos centralizado
- **Async/await**: Preparado para Prisma/DB
- **Mock fallback**: Desarrollo sin DB
- **Serialización centralizada**: Tipos JSON estables
- **Error handling uniforme**: errorHandler middleware

## ✨ Notas

- Sin autenticación aún (futuro: JWT en routes protegidas)
- Sin validación de entrada avanzada (express-validator ready)
- Sin rate limiting (preparado para implementar)
- El recomendador es determinista (explicable), sin IA
- Todo listo para Data API externa (futuro)
