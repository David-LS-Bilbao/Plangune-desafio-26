# Prompts de referencia · Claude · DESAFIO-26

Plantillas de prompt para trabajar con Claude Code en este repo.

> Claude ya lee [../../CLAUDE.md](../../CLAUDE.md) y [../../AGENTS.md](../../AGENTS.md). Estos prompts son para tareas concretas.
>
> Rol por defecto de Claude: **review/auditoría**; implementa solo si se le encarga explícitamente. Prompt base versionado en [prompts/CLAUDE_REVIEWER.md](prompts/CLAUDE_REVIEWER.md).
>
> **Regla de commits:** Claude Code **no hace commits** en este repositorio. Puede preparar cambios y proponer mensajes de commit, pero el commit lo ejecuta siempre una persona desde Git local para que Claude no aparezca como autor en el historial.

## Preámbulo recomendado

```
Trabaja en DESAFIO-26 (monorepo React + Express + PostgreSQL/Prisma, ver CLAUDE.md y AGENTS.md).
Flujo Git (ver docs/ai/GIT_BRANCHING_POLICY.md): no tocar main/dev/frontend/backend;
ramas frontend desde `frontend`, backend desde `backend`, docs/test desde `dev`;
sin `git add .`; revisar `git status --short` y `git diff --name-only` antes de commit;
NO commit/push/merge/rebase/reset/clean/force push sin que yo lo pida.
MVP + KISS. Alcance mínimo. Testing con Vitest.
```

## Plantilla: feature backend (MVC)

```
Implementa <feature> en backend/ siguiendo routes → controllers → services → models.
Añade validación (express-validator) y un test con supertest.
Rama: feat/<nombre> desde `backend`. Devuélveme resumen de archivos tocados; no commitees.
```

## Plantilla: feature frontend (mobile-first)

```
Implementa <pantalla/componente> en frontend/ (mobile-first, CSS propio).
Usa axios en src/services para llamar a la API. Añade test con Testing Library.
Rama: feat/<nombre> desde `frontend`. Devuélveme resumen; no commitees.
```

## Plantilla: revisión / refactor

```
Revisa <archivo/módulo> buscando bugs y simplificaciones de bajo riesgo.
No cambies comportamiento sin avisar. Propón antes de aplicar cambios grandes.
```

## Consejos

- Pide a Claude que use la TodoList en tareas multi-paso.
- Pide siempre el bloque final: resumen, archivos tocados, riesgos, siguiente rama.
