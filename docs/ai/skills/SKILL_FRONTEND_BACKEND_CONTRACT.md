# SKILL · Contrato Frontend ↔ Backend

Procedimiento para cualquier tarea que **consuma o modifique la API** en DESAFIO-26.

> **Regla base:** cualquier tarea frontend/backend que consuma o modifique API debe consultar
> [../../contracts/frontend-backend-api-contract.md](../../contracts/frontend-backend-api-contract.md)
> **antes de tocar código**.

La fuente de verdad es
[docs/contracts/frontend-backend-api-contract.md](../../contracts/frontend-backend-api-contract.md).
El índice de endpoints es [docs/api.md](../../api.md). El flujo está en
[docs/integration/frontend-backend.md](../../integration/frontend-backend.md).

---

## Antes de empezar

- **Antes de tocar frontend** que llame a la API: leer el contrato y usar solo Express `/api`
  vía `VITE_API_URL`. Nunca llamar a Data API, Flask, Python, Ollama ni al chatbot Data.
- **Antes de tocar backend de API**: leer el contrato y comprobar que tu cambio **no** altera el
  shape de respuesta, los nombres de endpoint ni los alias documentados.

## Reglas al modificar la API

1. **No cambiar el shape de respuesta** sin actualizar el contrato y `docs/api.md` en el mismo PR.
2. **No renombrar endpoints** sin avisar al equipo (rompe al frontend).
3. **No eliminar los alias legacy** sin un plan acordado:
   - `activity` (alias de `event` en `/api/recommendations`).
   - `activityId` (ruta pública de favoritos; `eventId` es la clave canónica interna/respuesta).
4. **No hacer llamadas directas** a Data/IA desde el frontend: Express es la fachada única.
5. **No inventar campos**: el modo IA del asistente usa `assistantMessageMarkdown` (no
   `assistantMessage`). El fallback usa `message` y `mode: "fallback"` (sin `source`).
6. **Respetar los `source` reales**:
   - `/api/recommendations`: `data-api` \| `local-fallback`.
   - `/api/assistant/family-plan` modo IA: `data-chatbot` \| `llm-local`.
   - `/api/assistant/family-plan` fallback: `mode: "fallback"`, puede no traer `source`.
7. **`source`/`mode` son metadatos técnicos**: no mostrarlos en crudo al usuario; la UI debe manejar
   el fallback sin romperse.
8. **Si cambias el contrato, añade o actualiza tests/mocks** que protejan el nuevo comportamiento.
9. **Actualiza `docs/api.md`** (y este contrato) cuando cambie cualquier endpoint, filtro o shape.

## Checklist rápido

- [ ] He leído el contrato antes de codificar.
- [ ] El frontend solo llama a Express `/api` (vía `VITE_API_URL`).
- [ ] No cambié shape/nombres/alias sin actualizar contrato + `docs/api.md`.
- [ ] La UI maneja `source: "local-fallback"` y `mode: "fallback"` sin romperse.
- [ ] Añadí/actualicé tests o mocks si cambió el contrato.

Ver también: [SKILL_REACT_MOBILE_FIRST.md](SKILL_REACT_MOBILE_FIRST.md),
[SKILL_EXPRESS_API_MVC.md](SKILL_EXPRESS_API_MVC.md), [SKILL_QUALITY.md](SKILL_QUALITY.md),
[../PR_REVIEW_CHECKLIST.md](../PR_REVIEW_CHECKLIST.md).
