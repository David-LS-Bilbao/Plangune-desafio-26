# Prompts de referencia · Claude · DESAFIO-26

Plantillas de prompt para trabajar con Claude Code en este repo.

> Claude ya lee [../../CLAUDE.md](../../CLAUDE.md) y [../../AGENTS.md](../../AGENTS.md). Estos prompts son para tareas concretas.

## Preámbulo recomendado

```
Trabaja en DESAFIO-26 (monorepo MERN, ver CLAUDE.md y AGENTS.md).
Flujo Git: no tocar main/dev, ramas desde dev, sin `git add .`,
revisar `git status --short` y `git diff --name-only` antes de commit,
y NO commitear sin que yo lo pida. MVP + KISS. Testing con Vitest.
```

## Plantilla: feature backend (MVC)

```
Implementa <feature> en backend/ siguiendo routes → controllers → services → models.
Añade validación (express-validator) y un test con supertest.
Rama: feat/<nombre>. Devuélveme resumen de archivos tocados; no commitees.
```

## Plantilla: feature frontend (mobile-first)

```
Implementa <pantalla/componente> en frontend/ (mobile-first, CSS propio).
Usa axios en src/services para llamar a la API. Añade test con Testing Library.
Rama: feat/<nombre>. Devuélveme resumen; no commitees.
```

## Plantilla: revisión / refactor

```
Revisa <archivo/módulo> buscando bugs y simplificaciones de bajo riesgo.
No cambies comportamiento sin avisar. Propón antes de aplicar cambios grandes.
```

## Consejos

- Pide a Claude que use la TodoList en tareas multi-paso.
- Pide siempre el bloque final: resumen, archivos tocados, riesgos, siguiente rama.
