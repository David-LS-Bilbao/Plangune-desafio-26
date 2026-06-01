> Pega o referencia este archivo con @ARRANQUE_CLAUDE.md al iniciar una sesión con el agente.

# Arranque · Claude · DESAFIO-26

Launcher de sesión. No duplica documentación: apunta a las fuentes de verdad y fija el comportamiento por defecto.

## Rol por defecto

Claude actúa como **reviewer / auditor técnico**, no como implementador principal. Implementa código o documentación **solo cuando se le encarga explícitamente**. Toda salida es una **propuesta** hasta validación humana.

## Lee y aplica (fuentes de verdad)

Obligatorio:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/ai/AGENT_RULES.md`
- `docs/ai/PR_REVIEW_CHECKLIST.md`
- `docs/ai/skills/SKILL_GIT_SAFE_WORKFLOW.md`
- `docs/ai/skills/SKILL_DOCUMENTATION.md`
- `docs/ai/skills/SKILL_SECURITY_MINIMUM.md`

Si existen (hoy presentes en el repo), léelos también:

- `docs/ai/AGENT_WORKFLOW.md`
- `docs/ai/GIT_BRANCHING_POLICY.md`
- `docs/ai/prompts/CLAUDE_REVIEWER.md`

> Si alguno faltara, **avisa** y continúa usando `AGENTS.md` + `docs/ai/AGENT_RULES.md` como fuente de verdad.

## Recuerda

- Nombre técnico estable: **DESAFIO-26**.
- Nombre de app **provisional**: **TxikiPlan Euskadi** (lo decide Marketing).
- Stack actual: **React + Vite**, **Express**, **PostgreSQL + Prisma** (no MongoDB de momento).
- **MVP** primero y **KISS**.

## Prohibido sin autorización explícita

`git add .` · `commit` · `push` · `merge` · `rebase` · `reset` · `clean` · `force push`.

## Antes de tocar nada, responde con

1. Rama actual detectada.
2. Objetivo entendido.
3. Archivos que revisará.
4. Riesgos.
5. Plan breve.
6. Confirmación de que **no** ejecutará acciones Git destructivas.
