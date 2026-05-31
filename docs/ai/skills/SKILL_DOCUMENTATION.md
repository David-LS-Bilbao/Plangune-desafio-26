# SKILL · Documentación

Cómo documentar en DESAFIO-26 para que el equipo y los agentes trabajen sin fricción.

## Dónde va cada cosa

- **README.md (raíz)**: visión de producto, MVP, roles, modelos previstos, endpoints.
- **AGENTS.md / CLAUDE.md**: reglas operativas para agentes de IA.
- **docs/**: documentación técnica y de IA.
- **docs/ai/skills/**: procedimientos paso a paso (como este).

## Principios

- Documentar lo **no obvio**: decisiones, convenciones, trampas conocidas.
- No duplicar lo que el código ya dice; enlazar en lugar de copiar.
- Mantener la doc cerca del cambio: si tocas comportamiento, actualiza su doc.
- Español correcto, con tildes. Bloques de código con su lenguaje.

## Nombre del proyecto

- El nombre de la app es **provisional** (lo define Marketing).
- En documentación técnica y nombres críticos usar `DESAFIO-26` / `desafio-26`.

## Plantilla para una decisión técnica (futuro `docs/decisions.md`)

```md
## <Título de la decisión>
- Fecha: AAAA-MM-DD
- Contexto: por qué surge.
- Decisión: qué se decidió.
- Alternativas: qué se descartó y por qué.
- Consecuencias: implicaciones.
```

## Checklist al documentar un cambio

- [ ] ¿Hay una doc afectada que deba actualizarse?
- [ ] ¿El cómo-ejecutar/probar sigue siendo correcto?
- [ ] ¿Enlazo en vez de duplicar?
- [ ] ¿Queda claro qué NO está implementado todavía?
