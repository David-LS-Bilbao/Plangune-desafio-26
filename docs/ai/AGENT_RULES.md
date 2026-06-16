# Reglas para agentes de IA · DESAFIO-26

Estas reglas aplican a cualquier agente de IA (Codex, Claude, ChatGPT/Chat Director) que genere código o documentación en este repo. Subordinadas a [../../AGENTS.md](../../AGENTS.md).

## 0. Roles y principio rector

> **Humano decide → IA ejecuta → Humano valida.**

- **ChatGPT / Chat Director**: planifica, define alcance, redacta prompts, valida.
- **Codex**: implementación controlada de tareas acotadas.
- **Claude**: review/auditoría; documentación solo cuando se le encarga explícitamente.
- **Humano**: aprobador final de commits, push, PR y merge.

Los **prompts se versionan y revisan como código** ("Prompt ≈ Código"): ver [prompts/](prompts/) y [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md).

## 1. Git seguro

- Nunca trabajar en `main`, `dev`, `frontend` ni `backend` (solo integración humana).
- Crear ramas de trabajo desde la rama de integración correcta: frontend sale de `frontend`, backend de `backend`, docs/test globales de `dev`. Detalle en [GIT_BRANCHING_POLICY.md](GIT_BRANCHING_POLICY.md).
- **Prohibido `git add .`** y `git add -A`. Añadir archivos uno a uno tras revisar.
- Antes de cada commit: `git status --short` y `git diff --name-only`.
- **Nunca ejecutar `commit`, `push`, `merge`, `rebase`, `reset`, `clean` ni `force push` sin que una persona lo pida explícitamente.**
- **Claude Code no ejecuta commits en este repositorio.** Puede preparar cambios, staged files y proponer mensajes, pero el commit final lo hace siempre una persona desde Git local para que Claude no aparezca como colaborador ni autor en el historial.
- Commits pequeños, descriptivos y en imperativo (`feat: ...`, `fix: ...`, `docs: ...`).

## 2. Alcance y prioridades

- MVP primero. KISS: lo simple que funcione antes que lo elegante.
- No añadir dependencias ni abstracciones que la tarea no pida.
- Respetar lo que la tarea dice **no** implementar.

## 3. Seguridad

- Nunca commitear `.env` ni secretos. Solo `.env.example` con valores ficticios.
- No almacenar datos sensibles de menores (producto para familias con niños pequeños).
- Validar y sanear entradas de usuario en el backend.
- Cuando exista auth/roles: control de acceso por middleware y revisión de **Broken Access Control / IDOR**.
- Todo código generado por IA pasa por **auditoría humana** antes de integrarse. Ver [prompts/SECURITY_REVIEWER.md](prompts/SECURITY_REVIEWER.md) y [skills/SKILL_SECURITY_MINIMUM.md](skills/SKILL_SECURITY_MINIMUM.md).

## 4. Calidad

- Cada cambio de comportamiento entra con su test (Vitest).
- Mantener el estilo del código existente (idioma, naming, formato).
- No dejar `console.log` de depuración en el código final.

## 5. Documentación

- Actualizar la documentación afectada por el cambio.
- Si una decisión técnica no es obvia, dejar nota en `docs/`.

## 6. Transparencia

- Reportar fielmente: si un test falla o un paso se omite, decirlo.
- Señalar riesgos detectados y la siguiente rama recomendada.

Ver procedimientos detallados en [skills/](skills/).
