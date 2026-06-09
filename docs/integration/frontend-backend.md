# Integración Frontend ↔ Backend (flujo) · DESAFIO-26

Cómo fluyen los datos entre React y Express. El **contrato** (endpoints, shapes, params) vive en
[../contracts/frontend-backend-api-contract.md](../contracts/frontend-backend-api-contract.md);
este documento explica **el flujo**, no lo repite.

> Cualquier tarea frontend/backend que consuma o modifique API debe consultar el contrato
> **antes de tocar código**.

---

## Principio: Express es la fachada única

React **solo** habla con Express bajo `/api`. Express decide la fuente real, normaliza el shape y
gestiona los fallbacks. React **nunca** llama a servicios internos.

```
                         ┌─────────────────────────────┐
                         │        Express  /api         │  ← única superficie pública
   React (Vite) ───────► │  routes → controllers →      │
   VITE_API_URL          │  services (orquestan)        │
                         └───────┬───────┬───────┬──────┘
                                 │       │       │
                  ┌──────────────┘       │       └───────────────┐
                  ▼                      ▼                        ▼
        Prisma / PostgreSQL        Data API (Flask)      ai-service (Ollama) /
        events, favoritos          recomendador           chatbot Data
        (datos reales)             principal               (asistente)
```

### 1. React → Express → Prisma/PostgreSQL

`GET /api/events`, `GET /api/events/:id`, `GET /api/favorites`,
`POST/DELETE /api/favorites/:activityId` → datos reales de la tabla `events` vía Prisma.

### 2. React → Express → Data API

`GET /api/recommendations` → Express llama al recomendador **Data (Flask)** como fuente principal.
Si Data falla o está deshabilitada, Express usa el **recomendador local** (Family Score sobre
`events`). El item lleva `source: "data-api"` o `"local-fallback"`. **React no nota la diferencia.**

### 3. React → Express → ai-service / chatbot Data

`POST /api/assistant/family-plan` → Express llama al LLM (chatbot Data dockerizado → `data-chatbot`,
o ai-service Flask+Ollama → `llm-local`). Si el LLM falla o está deshabilitado, Express responde con
`mode: "fallback"` (recomendaciones del recomendador local, sin IA).

---

## Reglas del flujo

- **React nunca llama a servicios internos** (Flask, Python, Ollama, chatbot Data, Postgres).
  Solo `VITE_API_URL` → Express `/api`.
- **Express normaliza** los datos: el frontend siempre recibe el mismo shape, venga de Data o del
  fallback local.
- **Express gestiona los fallbacks**: la caída de un servicio interno **no** debe llegar al usuario
  como un error; llega como `source: "local-fallback"` o `mode: "fallback"`.
- **`source` y `mode` son metadatos técnicos**: no se muestran en crudo al usuario.
- **La UI no debe romperse** en fallback: misma experiencia con datos de Data o locales.

---

## Despliegue (Docker / VPS)

Solo el gateway **Express** se publica. Postgres (`5434`), Data API/Flask y Ollama (`11434`) viven en
la red interna y **no son accesibles desde el navegador**. Por eso el frontend depende únicamente de
`VITE_API_URL`.

---

## Estado de integración

El frontend (`feature/frontend`) y el backend (`feature/backend`) avanzan por separado y se integran
cuando ambos estén listos (no se mergea a `dev` antes). El mapeo pantalla → endpoint y los pasos de
conexión están en [../integration-frontend-backend.md](../integration-frontend-backend.md).

Referencias: [contrato](../contracts/frontend-backend-api-contract.md) · [api.md](../api.md) ·
[integration-ai-ollama-local.md](../integration-ai-ollama-local.md).
