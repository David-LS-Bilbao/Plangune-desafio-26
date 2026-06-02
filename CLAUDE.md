# CLAUDE.md

Instrucciones para Claude Code (y agentes Claude) al trabajar en **DESAFIO-26**.

> Este archivo complementa a [AGENTS.md](AGENTS.md). Si hay conflicto, mandan las reglas de `AGENTS.md`.

## Contexto del proyecto

- Monorepo con npm workspaces: `frontend/` (React + Vite, JS) y `backend/` (Express, MVC). Stack **React + Express + PostgreSQL** (no MERN estricto: la DB es PostgreSQL, no MongoDB).
- API REST. **PostgreSQL + Prisma** preparados pero **sin features** en el bootstrap. (Se descartó MongoDB/Mongoose de momento.)
- Mobile-first, CSS propio (sin Tailwind), sin TypeScript.
- Producto: web/app para **familias con bebés y niños pequeños en Euskadi** (posible dato sensible de menores).
- Nombre de la app **provisional** (funcional: "TxikiPlan Euskadi"): usa `DESAFIO-26` como nombre técnico estable.

## Rol de Claude

Por defecto, Claude **revisa y audita** (ver [docs/ai/AGENT_WORKFLOW.md](docs/ai/AGENT_WORKFLOW.md)). Solo implementa código de feature o documentación cuando la tarea lo pide explícitamente. Toda salida es una **propuesta** hasta validación humana. Prompt base en [docs/ai/prompts/CLAUDE_REVIEWER.md](docs/ai/prompts/CLAUDE_REVIEWER.md).

## Flujo Git (obligatorio)

- No trabajar en `main`, `dev`, `frontend` ni `backend`. Ramas frontend salen de `frontend`, backend de `backend`, docs/test globales de `dev`. Ver [docs/ai/GIT_BRANCHING_POLICY.md](docs/ai/GIT_BRANCHING_POLICY.md).
- **Nunca `git add .`** ni `git add -A`: añade archivos explícitamente.
- Antes de commitear: `git status --short` + `git diff --name-only`.
- **No ejecutar `commit`, `push`, `merge`, `rebase`, `reset`, `clean` ni `force push` sin que la persona lo pida explícitamente.**
- **Claude Code no hace commits en este repositorio.** Puede preparar cambios, proponer mensajes y dejar staged files, pero el commit final lo ejecuta siempre una persona desde Git local, para evitar que Claude aparezca como colaborador o autor en el historial.
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

## Skills y prompts disponibles

- Skills (procedimientos paso a paso): [docs/ai/skills/](docs/ai/skills/) — git seguro, MVC, React mobile-first, testing, seguridad mínima, documentación.
- Prompts base reutilizables: [docs/ai/prompts/](docs/ai/prompts/) — Codex, Claude, Frontend, Backend, Security, Documentación Git.
