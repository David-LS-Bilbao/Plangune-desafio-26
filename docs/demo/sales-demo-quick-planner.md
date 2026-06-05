# Demo Ventas · Planificador rápido

## Objetivo

Esta rama contiene una **demo rápida** para enseñar a Ventas el flujo:

**Landing → Planificador → Recomendaciones.**

## Rama

`demo/frontend-sales-recommendations`

## Qué muestra

- Landing demo.
- Navegación Inicio / Planificador.
- Filtros familiares.
- Cards de planes recomendados.
- Razones de recomendación ("Por qué te recomendamos este plan").
- Estados loading / error / empty.

## Requisitos

- Node.js compatible con el proyecto.
- Dependencias instaladas con `npm install`.
- Backend Express levantado en `http://localhost:3000`.
- PostgreSQL / Docker levantado para datos reales.
- Variables `.env` correctas si aplica (frontend: `VITE_API_URL`; por defecto cae a `http://localhost:3000/api`).
- Frontend Vite en `http://localhost:5173`.

## Instalación

Desde la raíz del repo:

```bash
npm install
```

## Arrancar backend

```bash
npm run dev:backend
```

Debe responder en:

```
http://localhost:3000/api/health
```

(p. ej. `{ "status": "ok", "service": "DESAFIO-26 API" }`)

## Arrancar frontend

```bash
npm run dev --workspace frontend
```

## URLs de prueba

- Landing: `http://localhost:5173/`
- Planificador: `http://localhost:5173/planificador`

## Flujo de demo recomendado

1. Abrir Landing.
2. Pulsar **"Buscar planes"**.
3. Entrar en Planificador.
4. Usar filtros:
   - edad: `2`
   - municipio: `Bilbao`
   - presupuesto: `20`
   - carrito: sí
   - cambiador: sí
   - a cubierto / lluvia: sí
5. Pulsar **"Buscar planes"**.
6. Mostrar 3 cards con razones.

## Endpoint usado

`GET /api/recommendations`

Ejemplo:

```
http://localhost:3000/api/recommendations?childrenAges=2&municipality=Bilbao&strollerFriendly=true&changingTable=true&rainSuitable=true&budget=20&limit=3
```

> El frontend consume **solo** Express bajo `/api` (fachada única). Nunca llama directamente a
> Data API, Flask, Python, Ollama ni servicios internos.

## Qué NO toca esta demo

- No toca backend.
- No toca Prisma.
- No toca Docker.
- No toca Data API.
- No toca ai-service.
- No toca login.
- No toca admin.
- No toca favoritos.
- No toca mapa.

## Riesgos conocidos

- Si backend / DB no están levantados, la UI muestra estado de error (no rompe).
- La landing real del equipo queda **temporalmente sustituida** en `/` dentro de esta rama demo
  (`Landing.jsx` permanece intacto en el repo).
- No hay tests automatizados.
- Es una **rama demo**, no versión final.
- `package-lock.json` puede estar modificado por sincronización de dependencias ya declaradas.

## Cómo retirar la demo

- Borrar `frontend/src/components/layout/DemoLayout.jsx`.
- Borrar `frontend/src/pages/DemoLanding.jsx`.
- Borrar `frontend/src/pages/PlanificadorRapido.jsx` si no se conserva.
- Borrar `frontend/src/services/recommendations.js` si no se conserva.
- Revertir `frontend/src/routes/AppRoutes.jsx`.
- Revisar `package-lock.json`.
