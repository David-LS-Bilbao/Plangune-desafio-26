# SKILL · Testing desde el inicio

Cómo se testea en DESAFIO-26. Herramienta común: **Vitest**.

## Comandos

```bash
npm test                 # backend + frontend
npm run test:backend
npm run test:frontend

# en watch (dentro de cada paquete)
npm run test:watch --workspace backend
npm run test:watch --workspace frontend
```

## Backend (Vitest + supertest)

- Entorno Node (por defecto).
- Se testea la app vía `createApp()` sin abrir puerto.

```js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('GET /api/health', () => {
  it('responde ok', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
  });
});
```

## Frontend (Vitest + Testing Library + jsdom)

- Entorno `jsdom`, `globals: true`, setup con `@testing-library/jest-dom` (ver `vite.config.js` y `vitest.setup.js`).
- Consultar por rol/texto accesible.

```js
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

render(<App />);
expect(screen.getByRole('heading', { name: 'DESAFIO-26' })).toBeInTheDocument();
```

## Reglas

- Cada cambio de comportamiento entra con su test.
- Ubicar tests en `src/tests/` o junto al archivo como `*.test.js(x)`.
- Tests rápidos y deterministas; sin depender de servicios externos reales.

## Estado actual (bootstrap)

- Backend: 1 test → `GET /api/health`.
- Frontend: 2 tests → render de `DESAFIO-26` y del texto provisional.
