# AGENTS.md

Guía operativa para agentes de IA (Codex, Claude, ChatGPT/Chat Director) y personas que trabajen en **DESAFIO-26**. Es la **fuente de verdad global para agentes**: si otro documento contradice este, mandan estas reglas.

> El nombre de la app es **provisional** (lo definirá Marketing). El nombre funcional provisional es **"TxikiPlan Euskadi"**, pero **no lo fijes** como nombre técnico estable (paquetes, base de datos, identificadores). Usa `DESAFIO-26` / `desafio-26` como nombre técnico estable.

## Producto

Web/app responsive **mobile-first** para **familias con bebés y niños pequeños en Euskadi**. Por su naturaleza puede manejar datos sensibles de menores: prudencia máxima (ver seguridad).

## Qué es este repo

Monorepo con npm workspaces (React + Express + PostgreSQL; **no es MERN estricto**, ya que la base de datos es PostgreSQL, no MongoDB):

- `frontend/` — React + Vite (JavaScript, mobile-first).
- `backend/` — Node.js + Express, arquitectura MVC, API REST.
- `docs/` — documentación del proyecto y de IA.

**PostgreSQL + Prisma** están **preparados pero sin features** en esta fase de bootstrap. (Decisión de equipo: se descartó MongoDB/Mongoose de momento.)

## Roles (Humano decide → IA ejecuta → Humano valida)

- **ChatGPT / Chat Director**: planificación, alcance, prompts y validación de criterios.
- **Codex**: implementación controlada de tareas acotadas.
- **Claude**: review/auditoría y verificación; documentación cuando se le encarga explícitamente.
- **Humano**: aprobador final de commits, push, PR y merge; decide producto y arquitectura.

Detalle del flujo en [docs/ai/AGENT_WORKFLOW.md](docs/ai/AGENT_WORKFLOW.md). Los **prompts se versionan y revisan como código** ("Prompt ≈ Código"): viven en [docs/ai/prompts/](docs/ai/prompts/).

## Reglas de oro

1. **Nunca trabajar directamente en `main`, `dev`, `frontend` ni `backend`** (solo integración humana controlada).
2. Crear ramas de trabajo desde la rama de integración correcta: frontend sale de `frontend`, backend de `backend`, docs/test globales de `dev`. Ver [docs/ai/GIT_BRANCHING_POLICY.md](docs/ai/GIT_BRANCHING_POLICY.md).
3. **No usar `git add .`** ni `git add -A` — añadir archivos de forma explícita.
4. Antes de cada commit revisar: `git status --short` y `git diff --name-only`.
5. **Nunca ejecutar `commit`, `push`, `merge`, `rebase`, `reset`, `clean` ni `force push` sin confirmación explícita de una persona.**
6. No commitear secretos ni `.env`. Solo `.env.example`.
7. MVP primero. KISS: primero que funcione, luego se mejora. Respetar el alcance mínimo.
8. Testing desde el inicio: cada feature entra con su test mínimo.

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

- Flujo de agentes (Chat Director → Codex → Claude → Humano): [docs/ai/AGENT_WORKFLOW.md](docs/ai/AGENT_WORKFLOW.md)
- Política de ramas Git real: [docs/ai/GIT_BRANCHING_POLICY.md](docs/ai/GIT_BRANCHING_POLICY.md)
- Reglas para agentes: [docs/ai/AGENT_RULES.md](docs/ai/AGENT_RULES.md)
- Prompts base reutilizables: [docs/ai/prompts/](docs/ai/prompts/)
- Skills (procedimientos): [docs/ai/skills/](docs/ai/skills/)
- Checklist de PR: [docs/ai/PR_REVIEW_CHECKLIST.md](docs/ai/PR_REVIEW_CHECKLIST.md)
