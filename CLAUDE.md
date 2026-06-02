# CLAUDE.md

Instrucciones para Claude Code (y agentes Claude) al trabajar en **DESAFIO-26**.

> Este archivo complementa a [AGENTS.md](AGENTS.md). Si hay conflicto, mandan las reglas de `AGENTS.md`.

## Contexto del proyecto

- Monorepo con npm workspaces: `frontend/` (React + Vite, JS) y `backend/` (Express, MVC). Stack **React + Express + PostgreSQL** (no MERN estricto: la DB es PostgreSQL, no MongoDB).
- API REST. **PostgreSQL + Prisma** preparados pero **sin features** en el bootstrap. (Se descartó MongoDB/Mongoose de momento.)
- Mobile-first, CSS propio (sin Tailwind), sin TypeScript.
- Nombre de la app **provisional**: usa `DESAFIO-26` como nombre técnico estable.

## Flujo Git (obligatorio)

- No trabajar en `main` ni en `dev`. Ramas desde `dev`.
- **Nunca `git add .`**: añade archivos explícitamente.
- Antes de commitear: `git status --short` + `git diff --name-only`.
- No hacer commit ni push sin que la persona lo pida explícitamente.
- No subir `.env` ni secretos.

## Estilo de código

- Backend en ESM (`"type": "module"`), arquitectura MVC: `routes → controllers → services → models`.
- Frontend con componentes funcionales y CSS por clases (mobile-first).
- Cada cambio de comportamiento entra con su test (Vitest).
- Mantén el código en el idioma y estilo del entorno existente.

## Comandos útiles

```bash
npm install
npm run dev:backend     # http://localhost:3000  (GET /api/health)
npm run dev:frontend    # http://localhost:5173
npm test                # backend + frontend

# Prisma (workspace backend)
npm run prisma:generate --workspace backend   # genera el cliente
npm run prisma:migrate  --workspace backend    # migraciones (requiere DATABASE_URL)
npm run prisma:studio   --workspace backend    # GUI de la DB
npm run prisma:format   --workspace backend    # formatea schema.prisma
```

## Límites del bootstrap

No implementar: auth, roles, modelos completos, CRUD, dashboards, mapa, recomendador ni estilos finales.

## Skills disponibles

Ver [docs/ai/skills/](docs/ai/skills/) para procedimientos paso a paso (git seguro, MVC, React mobile-first, testing, seguridad mínima, documentación).
