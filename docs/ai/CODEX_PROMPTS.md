# Prompts de referencia · Codex · DESAFIO-26

Plantillas de prompt para trabajar con Codex en este repo. Adáptalas a cada tarea.

> Recuerda: nombre de app provisional, nombre técnico estable `DESAFIO-26`.

## Preámbulo recomendado (pegar al inicio)

```
Actúa como Senior Full-Stack Engineer (React + Express + PostgreSQL) en el proyecto DESAFIO-26.
Stack: monorepo npm workspaces, frontend React + Vite (JS), backend Express MVC,
PostgreSQL + Prisma, API REST, mobile-first, sin TypeScript, sin Tailwind.

Flujo Git obligatorio:
- No trabajar en main ni en dev.
- Crear ramas desde dev.
- No usar git add .
- Antes de commit: git status --short y git diff --name-only.
- No commitear sin que yo lo pida.

Prioridad: MVP y KISS. Testing desde el inicio (Vitest).
```

## Plantilla: nueva feature de backend

```
Tarea: implementar <feature> en backend siguiendo MVC.
- Ruta(s): <método y path>
- Controller + service + (modelo si aplica).
- Validación con express-validator.
- Test con Vitest + supertest.
Rama: feat/<nombre>. No commitees; déjame revisar.
```

## Plantilla: nueva feature de frontend

```
Tarea: implementar <pantalla/componente> en frontend.
- Mobile-first, CSS propio por clases.
- Consumir API con axios vía src/services.
- Test con Vitest + Testing Library.
Rama: feat/<nombre>. No commitees; déjame revisar.
```

## Buenas prácticas de prompting

- Indica siempre la rama esperada y que NO haga commit.
- Pide el resumen de archivos tocados al terminar.
- Pide que señale riesgos y siguiente paso.
