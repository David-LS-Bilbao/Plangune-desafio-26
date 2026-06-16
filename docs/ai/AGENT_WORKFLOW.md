# Flujo de agentes IA · DESAFIO-26

Cómo colaboran las personas y los agentes de IA en DESAFIO-26. Subordinado a [AGENTS.md](../../AGENTS.md).

## Principio rector

> **Humano decide → IA ejecuta → Humano valida.**

La IA acelera el trabajo, pero **no toma decisiones de producto, arquitectura, commits ni merges**.
Toda salida de IA es una **propuesta** hasta que una persona la revisa y la aprueba.

## Prompt ≈ Código

Los prompts que dirigen a los agentes son **artefactos versionados**, no texto desechable:

- Viven en [prompts/](prompts/) y se revisan como se revisa el código.
- Un cambio de prompt que altera el comportamiento del agente entra por PR documental (`docs/*` → `dev`).
- Si un prompt induce un error, se corrige el prompt (no solo el resultado).

## Roles

| Rol                     | Responsabilidad principal                                                                 | Límite                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **ChatGPT / Chat Director** | Planificación, definición de alcance, redacción de prompts, validación de criterios   | No implementa código directamente; no decide por el humano       |
| **Codex**               | Implementación controlada de tareas concretas y acotadas                                  | No amplía el alcance; no hace commit/push/merge sin permiso      |
| **Claude**              | Review, auditoría y verificación; documentación cuando se le encarga explícitamente       | No implementa features salvo encargo explícito; no integra ramas; **no ejecuta commits** |
| **Humano**              | Aprobador final de commits, push, PR y merge; decide producto y arquitectura              | —                                                                |

Notas:

- **Claude** por defecto **revisa y audita**. Solo escribe código de feature o documentación cuando la tarea lo pide de forma explícita (como este ciclo de documentación).
- **Claude Code no hace commits en este repositorio.** Puede preparar cambios, staged files y mensajes sugeridos, pero el commit final lo ejecuta siempre una persona desde Git local para evitar que Claude aparezca como colaborador o autor en el historial.
- **Codex** implementa lo que el Chat Director ha acotado; ante ambigüedad, se detiene y pregunta.
- **El humano** es el único que ejecuta o autoriza operaciones Git sensibles (ver [GIT_BRANCHING_POLICY.md](GIT_BRANCHING_POLICY.md)).

## Ciclo de trabajo

```txt
1. DECIDIR   (Humano + Chat Director)
   Definir objetivo, alcance mínimo (MVP/KISS) y criterios de aceptación.
   Redactar/ajustar el prompt en docs/ai/prompts/.

2. EJECUTAR  (Codex / Claude según la tarea)
   Crear la rama de trabajo correcta (ver GIT_BRANCHING_POLICY.md).
   Implementar o documentar SOLO lo acotado. Sin git add . Sin commit automático.

3. REVISAR   (Claude + Humano)
   Auditoría de código generado por IA: bugs, seguridad, alcance, tests.
   Pasar PR_REVIEW_CHECKLIST.md.

4. VALIDAR   (Humano)
   El humano aprueba y ejecuta commit/push/PR/merge.
```

## Reglas transversales para todos los agentes

- **MVP y KISS**: primero que funcione y sea simple; nada de abstracciones no pedidas.
- **Mobile-first** en frontend.
- **Alcance mínimo**: respetar lo que la tarea dice *no* implementar.
- **Seguridad**: sin secretos, sin `.env` reales, sin datos sensibles de menores, validación de inputs y control de acceso (ver [SECURITY_REVIEWER](prompts/SECURITY_REVIEWER.md) y [SKILL_SECURITY_MINIMUM](skills/SKILL_SECURITY_MINIMUM.md)).
- **Auditoría humana**: todo código generado por IA pasa por revisión humana antes de integrarse.
- **Transparencia**: reportar fielmente fallos, pasos omitidos y riesgos.

## Mapa de documentación de agentes

- [AGENTS.md](../../AGENTS.md) — fuente de verdad global para agentes.
- [CLAUDE.md](../../CLAUDE.md) — instrucciones específicas de Claude, subordinadas a AGENTS.md.
- [AGENT_RULES.md](AGENT_RULES.md) — reglas detalladas.
- [GIT_BRANCHING_POLICY.md](GIT_BRANCHING_POLICY.md) — flujo Git real.
- [AGENT_WORKFLOW.md](AGENT_WORKFLOW.md) — este documento.
- [prompts/](prompts/) — prompts base reutilizables (versionados).
- [skills/](skills/) — skills operativas paso a paso.
