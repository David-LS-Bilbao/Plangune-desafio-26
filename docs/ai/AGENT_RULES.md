# Reglas para agentes de IA · DESAFIO-26

Estas reglas aplican a cualquier agente de IA (Codex, Claude, etc.) que genere código o documentación en este repo.

## 1. Git seguro

- Nunca trabajar en `main` ni en `dev`.
- Crear ramas desde `dev`: `feat/*`, `fix/*`, `docs/*`, `test/*`.
- **Prohibido `git add .`**. Añadir archivos uno a uno tras revisar.
- Antes de cada commit: `git status --short` y `git diff --name-only`.
- No hacer commit/push sin que la persona lo pida explícitamente.
- Commits pequeños, descriptivos y en imperativo (`feat: ...`, `fix: ...`, `docs: ...`).

## 2. Alcance y prioridades

- MVP primero. KISS: lo simple que funcione antes que lo elegante.
- No añadir dependencias ni abstracciones que la tarea no pida.
- Respetar lo que la tarea dice **no** implementar.

## 3. Seguridad

- Nunca commitear `.env` ni secretos. Solo `.env.example` con valores ficticios.
- No almacenar datos sensibles de menores.
- Validar y sanear entradas de usuario en el backend.

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
