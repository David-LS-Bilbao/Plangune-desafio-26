# Feature · Estado de la integración Backend ↔ Chatbot Data

- **Fecha:** 2026-06-04
- **Rama:** `docs/backend-data-chatbot-integration-status`
- **Estado:** feature mergeada (`feat(assistant): support Data chatbot get-question contract`) · smoke real ejecutado
- **Docs relacionados:** [../api.md](../api.md) · [../integration-ai-ollama-local.md](../integration-ai-ollama-local.md)

> **Nombre técnico estable:** DESAFIO-26. App provisional: *TxikiPlan Euskadi* (lo define Marketing).

---

## 1. Resumen

El backend Express puede consumir el **chatbot Data dockerizado** (`urkomen/Desafio-Data`) como
fuente del asistente conversacional, manteniendo **Express como única fachada pública**. El
contrato público no cambia: el frontend sigue llamando a `POST /api/assistant/family-plan`.
Internamente, con `LLM_ASSISTANT_CONTRACT=get-question`, Express traduce la petición a una llamada
`GET /<question>` contra el chatbot Data.

La integración es **resiliente**: si Data no responde, da timeout, devuelve un status no-2xx, un
body vacío o un `HTTP 200` cuyo cuerpo empieza por `ERROR:`, Express usa el **fallback local**
(recomendador reglado sobre eventos de Prisma/PostgreSQL). El frontend siempre recibe una respuesta
útil con `200`.

**Estado actual del smoke real:** el chatbot Data responde `HTTP 200` con body `ERROR:` por un bug
preexistente en el repo Data (ver §8), por lo que Express devuelve `mode: "fallback"`. Esto **no es
un fallo de Express**: el fallback funciona exactamente como está diseñado.

---

## 2. Arquitectura

```
Frontend React
  → Express  POST /api/assistant/family-plan   (contrato público estable)
      → Data chatbot  GET /<question>          (LLM_ASSISTANT_CONTRACT=get-question)
          → Ollama / APIs externas (eventos Euskadi, weather)
```

- El **frontend nunca llama al chatbot Data**: solo habla con Express.
- **Express decide**: si el asistente LLM está habilitado y el contrato es `get-question`, compone
  una pregunta en lenguaje natural (mensaje del usuario + contexto familiar) y llama al chatbot
  Data; si está deshabilitado o algo falla, usa el fallback local.
- **Contrato público intacto**: `POST /api/assistant/family-plan` (body con `message` y
  `familyProfile` / campos sueltos). No se modificó controller ni routes.

---

## 3. Repo Data

- **Repositorio:** `urkomen/Desafio-Data`.
- **Servicio:** chatbot Flask **dockerizado**.
- **Host local esperado:** `localhost:5001`.
- **Endpoints que expone actualmente:**
  - `GET /`
  - `GET /<path:question>` — recibe la pregunta como parte de la ruta y devuelve texto (Markdown).

> El chatbot Data **aún no** expone `POST /assistant/family-plan`; por eso Express usa el contrato
> `get-question` y no esperamos a que Data implemente el POST.

---

## 4. Variables de entorno

Definidas en [`backend/.env.example`](../../backend/.env.example):

| Variable | Valor de ejemplo | Función |
|---|---|---|
| `LLM_ASSISTANT_ENABLED` | `false` | Activa el asistente LLM. Por defecto `false` (no se cambia). |
| `LLM_ASSISTANT_API_URL` | `http://localhost:5001` | Host del proveedor LLM (chatbot Data o ai-service). |
| `LLM_ASSISTANT_TIMEOUT_MS` | `8000` | Timeout de la llamada (Express aborta a los 8s). |
| `LLM_ASSISTANT_CONTRACT` | `get-question` | Protocolo a usar (ver §5). Default en código: `post-family-plan`. |

> `.env.example` trae `LLM_ASSISTANT_CONTRACT=get-question` (objetivo actual: consumir el chatbot
> Docker de Data). El **default en código** es `post-family-plan` por retrocompatibilidad con el
> ai-service histórico.

---

## 5. Contratos soportados

`LLM_ASSISTANT_CONTRACT` selecciona el protocolo; solo corre un proveedor a la vez en `:5001`.

| Contrato | Proveedor | Llamada de Express | `source` en respuesta |
|---|---|---|---|
| `post-family-plan` | ai-service Flask histórico (Ollama) | `POST {API_URL}/assistant/family-plan` | `llm-local` |
| `get-question` | chatbot Data dockerizado | `GET {API_URL}/${encodeURIComponent(question)}` | `data-chatbot` |

- **`source: "data-chatbot"`** se devuelve **solo** cuando Data responde con Markdown válido
  (cuerpo no vacío y que no empieza por `ERROR:`).
- **`source: "local-fallback"`** se devuelve cuando Data falla y entra el recomendador local.
- En modo IA (`mode: "ai"`), `recommendations` viene `[]` (el chatbot devuelve principalmente
  Markdown en `assistantMessageMarkdown`).

Respuesta IA (Data OK):

```json
{
  "mode": "ai",
  "source": "data-chatbot",
  "assistantMessageMarkdown": "## Plan en Bilbao\n\n...markdown...",
  "recommendations": []
}
```

Respuesta fallback (Data falla o LLM deshabilitado):

```json
{
  "mode": "fallback",
  "message": "El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.",
  "recommendations": [ /* hasta 3, cada uno con source: "local-fallback" */ ]
}
```

---

## 6. Fallback

Express cae al recomendador local en **cualquiera** de estos casos:

- **Timeout** (se supera `LLM_ASSISTANT_TIMEOUT_MS`, `AbortController`).
- **Status no-2xx** (p. ej. `500`).
- **Body vacío**.
- **`HTTP 200` con cuerpo que empieza por `ERROR:`** — caso clave: el chatbot Data señala sus
  fallos internos con un 200 cuyo texto arranca con `ERROR:`; Express lo trata como fallo.
- Error de red o respuesta inválida.

En todos ellos el cliente (`fetchLlmQuestion`) lanza y el servicio (`assistant.service.js`) captura
y devuelve el fallback. El usuario final siempre recibe `200`.

---

## 7. Smoke real ejecutado

**Entorno:** chatbot Data activo en `localhost:5001` + backend en `localhost:3000`.

**Request:**

```bash
curl -X POST http://localhost:3000/api/assistant/family-plan \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Plan gratis para hoy en Bilbao",
    "familyProfile": { "childrenAges": [3], "municipality": "Bilbao" }
  }'
```

**Resultado obtenido:**

- `mode: "fallback"`
- recomendaciones locales con `source: "local-fallback"`

**Interpretación:**

- La integración Express ↔ Data **funciona end-to-end**: Express llamó al chatbot Data, detectó que
  la respuesta era un fallo (`HTTP 200` con body `ERROR:`) y activó el fallback local **sin romperse**.
- El resultado `fallback` **no** indica un error de Express, sino un **bug preexistente del repo
  Data** (ver §8). El contrato de resiliencia se cumple.

---

## 8. Bug pendiente en Data

- **Archivo:** `API_LLM_original_v3.py` (repo `urkomen/Desafio-Data`).
- **Síntoma:** el chatbot devuelve `HTTP 200` con body `ERROR:` en lugar de Markdown.
- **Causa raíz:** eventos de Euskadi que llegan con `municipalityEs` **nulo**; al construir
  `lat/lon/weather` a partir del municipio, el flujo falla y el script emite `ERROR:`.
- **Impacto en Express:** ninguno funcional — el fallback local cubre el caso. Pero impide ver el
  modo IA (`mode: "ai"`, `source: "data-chatbot"`) end-to-end hasta que Data lo corrija.

> Este bug es **de Data**, no de este repo. No se toca el repo Data desde aquí.

---

## 9. Siguiente paso recomendado

Acción en el **repo Data** (`urkomen/Desafio-Data`), no en este repo:

- Crear rama **`fix/chatbot-null-municipality-weather`** y manejar `municipalityEs` nulo antes de
  construir `lat/lon/weather` (saltar el evento o usar un valor por defecto), de modo que el chatbot
  devuelva Markdown válido en lugar de `ERROR:`.
- **Alternativa / complemento:** auditar el recomendador `/planes` para garantizar que los eventos
  con municipio nulo no rompen el pipeline.

Cuando Data devuelva Markdown válido, el mismo smoke debería pasar a `mode: "ai"` y
`source: "data-chatbot"` sin cambios en Express.

---

## 10. Limitaciones

- **Flask dev server**: el chatbot Data corre sobre el servidor de desarrollo de Flask, no apto para
  producción.
- **`eval()`**: el prototipo LLM ejecuta `eval()` sobre salida del modelo → riesgo de ejecución
  arbitraria. Aceptable **solo en local controlado**.
- **Ollama local**: requiere Ollama + el modelo corriendo en la máquina.
- **APIs externas**: depende de servicios externos (eventos de Euskadi, weather) que pueden fallar o
  devolver datos incompletos (origen del bug actual).
- **No producción**: integración pensada para **demo en entorno local controlado**. No exponer el
  chatbot Data a internet ni conectarlo directamente al frontend; Express es la única fachada pública.
