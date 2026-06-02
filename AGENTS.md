# AGENTS.md

Guía operativa para agentes de IA (Codex, Claude, etc.) y personas que trabajen en **DESAFIO-26**.

> El nombre de la app es **provisional** (lo definirá Marketing). No lo fijes como definitivo en nombres técnicos críticos (paquetes, base de datos, identificadores). Usa `DESAFIO-26` / `desafio-26` como nombre técnico estable.

## Qué es este repo

Monorepo con npm workspaces (React + Express + PostgreSQL; **no es MERN estricto**, ya que la base de datos es PostgreSQL, no MongoDB):

- `frontend/` — React + Vite (JavaScript, mobile-first).
- `backend/` — Node.js + Express, arquitectura MVC, API REST.
- `docs/` — documentación del proyecto y de IA.

**PostgreSQL + Prisma** están **preparados pero sin features** en esta fase de bootstrap. (Decisión de equipo: se descartó MongoDB/Mongoose de momento.)

## Reglas de oro

1. **Nunca trabajar directamente en `main` ni en `dev`.**
2. Crear ramas siempre desde `dev` (`feat/*`, `fix/*`, `docs/*`, `test/*`).
3. **No usar `git add .`** — añadir archivos de forma explícita.
4. Antes de cada commit revisar: `git status --short` y `git diff --name-only`.
5. No commitear secretos ni `.env`. Solo `.env.example`.
6. MVP primero. KISS: primero que funcione, luego se mejora.
7. Testing desde el inicio: cada feature entra con su test mínimo.

## Comandos

```bash
# Instalar todo (desde la raíz, usa workspaces)
npm install

# Arrancar
npm run dev:backend     # API en http://localhost:3000
npm run dev:frontend    # Cliente en http://localhost:5173

# Tests
npm test                # todos los workspaces
npm run test:backend
npm run test:frontend

# Prisma / PostgreSQL (workspace backend)
npm run prisma:generate --workspace backend
npm run prisma:migrate  --workspace backend    # requiere DATABASE_URL
npm run prisma:studio   --workspace backend
npm run prisma:format   --workspace backend
```

## Qué NO implementar todavía

auth, roles, modelos Prisma completos, CRUD, dashboards, mapa, recomendador (Family Score) y estilos finales. Eso llega en ramas posteriores.

## Documentación detallada

- Reglas para agentes: [docs/ai/AGENT_RULES.md](docs/ai/AGENT_RULES.md)
- Skills (procedimientos): [docs/ai/skills/](docs/ai/skills/)
- Checklist de PR: [docs/ai/PR_REVIEW_CHECKLIST.md](docs/ai/PR_REVIEW_CHECKLIST.md)
