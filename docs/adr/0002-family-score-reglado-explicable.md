# ADR-0002 · Family Score reglado, determinista y explicable

- Fecha: 2026-06-02
- Estado: aceptada

## Contexto

El recomendador (`GET /api/recommendations`) es la pieza diferencial del producto. Se
valoró usar IA/ML (Python/Ollama), pero para el MVP eso añade dependencia, no determinismo
y dificulta explicar al jurado **por qué** se recomienda un plan.

## Decisión

- El Family Score es **reglado, determinista y explicable**, implementado en
  `backend/src/services/recommendation.service.js` (sin IA).
- Cada recomendación devuelve `{ activity, score, reasons }`, donde `reasons` son cadenas
  legibles que explican el match (edad, carrito, lluvia, presupuesto, cercanía).
- La respuesta se limita a **3** planes ordenados por score, y solo considera actividades `approved`.
- El asistente (`POST /api/assistant/family-plan`) reutiliza este recomendador como
  **fallback controlado** cuando no hay IA disponible (`mode: "fallback"`).

## Consecuencias

- ✅ Resultado reproducible y defendible ante jurado; fácil de testear por invariantes (orden, shape, límite, exclusión de `pending`).
- ✅ Sin dependencia de Python/Ollama para la demo.
- ⚠️ El scoring es simple; una futura integración con Data debe **mantener el contrato** (`score` + `reasons`) aunque cambie el cálculo.
- 🔒 Los tests no fijan scores exactos (frágiles); afirman invariantes y que el top tiene `reasons` no vacías.

Relacionado: [../api.md](../api.md), [../quality/README.md](../quality/README.md).
