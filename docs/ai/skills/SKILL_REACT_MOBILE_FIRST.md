# SKILL · React mobile-first

Convenciones de frontend para DESAFIO-26 (React + Vite, CSS propio).

> **Contrato API:** cualquier tarea frontend que consuma o modifique API debe consultar
> [../../contracts/frontend-backend-api-contract.md](../../contracts/frontend-backend-api-contract.md)
> **antes de tocar código**. Ver también [SKILL_FRONTEND_BACKEND_CONTRACT.md](SKILL_FRONTEND_BACKEND_CONTRACT.md).

## Principios

- **Mobile-first**: estilos base para móvil; usar `@media (min-width: ...)` para crecer.
- CSS propio por clases (sin Tailwind, sin TypeScript).
- Componentes funcionales y pequeños.

## Consumo de API (fachada única)

- El frontend consume **solo** Express bajo `/api`, vía `import.meta.env.VITE_API_URL`.
- **Nunca** llamar directamente a Data API, Flask, Python, Ollama, chatbot Data ni puertos internos
  (`5434`, `11434`, etc.). Express normaliza y gestiona los fallbacks.
- Tratar `source` (`data-api`/`local-fallback`/`data-chatbot`/`llm-local`) y `mode` (`ai`/`fallback`)
  como **metadatos técnicos**: no mostrarlos en crudo. La UI debe manejar el fallback sin romperse.

## Estructura de `frontend/src`

```txt
assets/        imágenes y recursos estáticos
components/
  common/      botones, inputs, tarjetas reutilizables
  layout/      cabecera, footer, contenedores
  activities/  componentes de planes/actividades
  auth/        login/registro (futuro)
  business/    panel de negocio (futuro)
  admin/       panel admin (futuro)
pages/         pantallas asociadas a rutas
routes/        configuración de React Router
services/      llamadas a la API con axios
context/       estado global (auth, etc.)
hooks/         hooks reutilizables
styles/        CSS global y variables
tests/         tests con Vitest + Testing Library
```

## Patrón de servicio API (axios)

```js
// src/services/api.js (futuro)
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3000/api
});
```

## Estilos mobile-first (ejemplo)

```css
.card { padding: 1rem; }            /* base: móvil */

@media (min-width: 600px) {         /* tablet+ */
  .card { padding: 1.5rem; }
}
```

## Tests

- Renderizar con `@testing-library/react` y consultar por rol/texto accesible.
- Evitar testear detalles de implementación; testear lo que ve el usuario.

## Estado actual (bootstrap)

`App.jsx` muestra el título `DESAFIO-26`, el texto provisional y enlaces placeholder. Aún no hay routing real.
