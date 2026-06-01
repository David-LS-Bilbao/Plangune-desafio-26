# Prompts de referencia · Codex · DESAFIO-26

Plantillas de prompt para trabajar con Codex en este repo. Adáptalas a cada tarea.

> Recuerda: nombre de app provisional (funcional "TxikiPlan Euskadi"), nombre técnico estable `DESAFIO-26`.
>
> Prompt base completo y versionado en [prompts/CODEX_EXECUTOR.md](prompts/CODEX_EXECUTOR.md). Rol de Codex: implementación controlada (ver [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md)).

## Preámbulo recomendado (pegar al inicio)

```
Actúa como Senior Full-Stack Engineer (React + Express + PostgreSQL) en el proyecto DESAFIO-26.
Stack: monorepo npm workspaces, frontend React + Vite (JS), backend Express MVC,
PostgreSQL + Prisma, API REST, mobile-first, sin TypeScript, sin Tailwind.

Flujo Git obligatorio (ver docs/ai/GIT_BRANCHING_POLICY.md):
- No trabajar en main, dev, frontend ni backend.
- Ramas frontend salen de `frontend`; ramas backend de `backend`; docs/test globales de `dev`.
- No usar git add . ni git add -A.
- Antes de commit: git status --short y git diff --name-only.
- No commit/push/merge/rebase/reset/clean/force push sin que yo lo pida.

Prioridad: MVP y KISS. Alcance mínimo. Testing desde el inicio (Vitest).
```

## Plantilla: nueva feature de backend

```
Tarea: implementar <feature> en backend siguiendo MVC.
- Ruta(s): <método y path>
- Controller + service + (modelo si aplica).
- Validación con express-validator.
- Acceso a datos con Prisma (no Mongoose).
- Test con Vitest + supertest.
Rama: feat/<nombre> desde `backend`. No commitees; déjame revisar.
```

## Plantilla: nueva feature de frontend

```
Tarea: implementar <pantalla/componente> en frontend.
- Mobile-first, CSS propio por clases.
- Consumir API con axios vía src/services.
- Test con Vitest + Testing Library.
Rama: feat/<nombre> desde `frontend`. No commitees; déjame revisar.
```

## Buenas prácticas de prompting

- Indica siempre la rama esperada y que NO haga commit.
- Pide el resumen de archivos tocados al terminar.
- Pide que señale riesgos y siguiente paso.
