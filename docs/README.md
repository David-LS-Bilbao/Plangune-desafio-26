# Documentación · DESAFIO-26

Índice de la documentación del proyecto. El `README.md` raíz contiene la visión de producto completa; aquí se recoge la documentación técnica y de IA.

> Nombre de la app **provisional** (lo define Marketing). Funcional provisional: "TxikiPlan Euskadi". Nombre técnico estable: `DESAFIO-26`.
>
> **Stack de datos actual: PostgreSQL + Prisma.** El proyecto se preparó inicialmente para MongoDB/Mongoose, pero el equipo decidió no usar MongoDB de momento. El stack es React + Express + PostgreSQL (no MERN estricto).

## Estructura

```txt
docs/
├── README.md                      # este índice
└── ai/
    ├── AGENT_WORKFLOW.md          # flujo Chat Director → Codex → Claude → Humano
    ├── GIT_BRANCHING_POLICY.md    # flujo Git real (main/dev/frontend/backend)
    ├── AGENT_RULES.md             # reglas para agentes de IA
    ├── CODEX_PROMPTS.md           # prompts de referencia para Codex (ver también prompts/)
    ├── CLAUDE_PROMPTS.md          # prompts de referencia para Claude (ver también prompts/)
    ├── PR_REVIEW_CHECKLIST.md     # checklist antes de abrir/mergear PR
    ├── prompts/                   # prompts base reutilizables (versionados)
    │   ├── ANTIGRAVITY_PROJECT_START.md  # arranque seguro en Google Antigravity
    │   ├── CODEX_EXECUTOR.md
    │   ├── CLAUDE_REVIEWER.md
    │   ├── GIT_DOCUMENTATION_AGENT.md
    │   ├── SECURITY_REVIEWER.md
    │   ├── FRONTEND_AGENT.md
    │   └── BACKEND_AGENT.md
    └── skills/                    # procedimientos paso a paso
        ├── SKILL_GIT_SAFE_WORKFLOW.md
        ├── SKILL_MERN_MVC_BOOTSTRAP.md   # legacy: nombre conserva "MERN"; stack real = PostgreSQL/Prisma
        ├── SKILL_REACT_MOBILE_FIRST.md
        ├── SKILL_EXPRESS_API_MVC.md
        ├── SKILL_TESTING_BOOTCAMP.md
        ├── SKILL_SECURITY_MINIMUM.md
        └── SKILL_DOCUMENTATION.md
```

## Documentación técnica prevista (futuras ramas)

A medida que avance el proyecto, se irán añadiendo: `architecture.md`, `api.md`, `data-model.md`, `security.md`, `family-score.md`, `git-workflow.md`, `decisions.md`.

## Enlaces rápidos

- Guía de agentes (fuente de verdad): [../AGENTS.md](../AGENTS.md)
- Guía de Claude: [../CLAUDE.md](../CLAUDE.md)
- Flujo de agentes: [ai/AGENT_WORKFLOW.md](ai/AGENT_WORKFLOW.md)
- Política de ramas Git: [ai/GIT_BRANCHING_POLICY.md](ai/GIT_BRANCHING_POLICY.md)
- Reglas de IA: [ai/AGENT_RULES.md](ai/AGENT_RULES.md)
