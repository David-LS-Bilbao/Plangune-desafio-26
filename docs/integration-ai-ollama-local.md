# Integración del asistente LLM local (Ollama) · DESAFIO-26

> ⚠️ **Solo demo en entorno local controlado.** El prototipo ejecuta `eval()` sobre código
> generado por un LLM. **No** usar en producción, **no** exponerlo a internet, **no** conectar el
> frontend directamente al servicio Python. Ver §Riesgos.

## Objetivo

Integrar el prototipo LLM de Danilo como **asistente conversacional** de la app, manteniendo
**Express como fachada única** para el frontend. El asistente devuelve un texto en Markdown con
planes/eventos recomendados a partir del mensaje del usuario.

## Arquitectura local

```
Frontend React → Backend Express → ai-service Flask (:5001) → Ollama / API Euskadi / Open-Meteo
```

- El **frontend nunca llama a Flask**: solo habla con Express (`/api/assistant/family-plan`).
- **Express** decide: si el asistente LLM está habilitado, llama al `ai-service`; si no, o si falla,
  usa el **fallback local** (recomendador reglado sobre eventos de Prisma).
- El **ai-service** (Python/Flask) envuelve el script de Danilo y lo ejecuta con `subprocess`
  en cada request.

## Dos contratos LLM (`LLM_ASSISTANT_CONTRACT`)

Express habla con un proveedor LLM en `LLM_ASSISTANT_API_URL` (por defecto `:5001`). El
**protocolo** se elige con `LLM_ASSISTANT_CONTRACT`; solo corre uno de los dos a la vez:

| Contrato | Proveedor | Llamada de Express | `source` |
|---|---|---|---|
| `get-question` | **chatbot Data** dockerizado (`urkomen/Desafio-Data`) | `GET {API_URL}/<pregunta>` | `data-chatbot` |
| `post-family-plan` | **ai-service** Flask histórico (este doc) | `POST {API_URL}/assistant/family-plan` | `llm-local` |

- `.env.example` trae `LLM_ASSISTANT_CONTRACT=get-question` (objetivo actual: consumir el
  chatbot Docker de Data). El **default en código** es `post-family-plan` (retrocompatible).
- En ambos contratos, si el LLM está deshabilitado, da timeout, error de red, status no-2xx,
  body vacío, respuesta inválida o (solo Data) **HTTP 200 con cuerpo que empieza por `ERROR:`**,
  Express usa el **fallback local** (recomendador reglado sobre Prisma).

### Contrato `get-question` (chatbot Data)

- El chatbot Data expone `GET /` y `GET /<path:question>` en `:5001`.
- Express compone una pregunta en español a partir de `message` + contexto familiar
  (`Familia con niños de X años. Municipio: Y.`) y la codifica:
  `GET {API_URL}/${encodeURIComponent(question)}`.
- **Importante:** el chatbot Data puede responder **HTTP 200 con cuerpo `ERROR:`** cuando falla
  internamente. El cliente Express lo trata como fallo (igual que body vacío) y activa el fallback.

## ai-service (Python/Flask, puerto 5001)

Carpeta [`ai-service/`](../ai-service/):

| Archivo | Qué es |
|---|---|
| `app.py` | Fachada Flask (`/health`, `/assistant/family-plan`) en `:5001` |
| `API_LLM_original.py` | Prototipo de Danilo (Ollama + eventos Euskadi + Open-Meteo). Copia sin modificar |
| `requirements.txt` | `flask`, `ollama`, `requests`, `pandas` |
| `README.md` | Puesta en marcha |

> **Puerto 5001** (el **5000 queda reservado** para la Data API `/planes`, integración aparte).

### Endpoint Python

`POST /assistant/family-plan`

```json
{ "message": "Plan gratis para hoy en Bilbao",
  "familyProfile": { "childrenAges": [3], "municipality": "Bilbao" } }
```

- OK → `{ mode:"ai", source:"llm-local", assistantMessageMarkdown:"...", recommendations:[] }`
- Fallback (stdout vacío / subprocess falla / timeout) → `{ mode:"fallback", source:"llm-local", assistantMessageMarkdown:"Lo sentimos, no hemos encontrado...", recommendations:[] }`

`app.py` ejecuta el script con `sys.executable` (intérprete del venv), pasa el `message` como
argumento, aplica **timeout** (`AI_SCRIPT_TIMEOUT_SECONDS`, por defecto 120s) y **nunca devuelve
trazas internas** al cliente.

### Requisitos Ollama

- [Ollama](https://ollama.com) instalado y corriendo.
- Modelo **`qwen2.5-coder:latest`**: `ollama pull qwen2.5-coder:latest`.

### Arranque

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
ollama pull qwen2.5-coder:latest
python app.py        # http://localhost:5001
```

## Backend Express (fachada pública)

`POST /api/assistant/family-plan`

- **Controller** ([assistant.controller.js](../backend/src/controllers/assistant.controller.js)):
  acepta `message` + `familyProfile`, manteniendo compatibilidad con los campos sueltos actuales
  (`childrenAges`, `strollerFriendly`, `rainSuitable`, `budget`, `municipality`).
- **Service** ([assistant.service.js](../backend/src/services/assistant.service.js)):
  - `LLM_ASSISTANT_ENABLED=true` → intenta el LLM local; si responde bien, devuelve su JSON adaptado
    (`mode:"ai"`, `source:"llm-local"`, `assistantMessageMarkdown`, `recommendations`).
  - si falla / timeout / 5xx / inválido, o `LLM_ASSISTANT_ENABLED=false` → **fallback local**
    (`mode:"fallback"`, `message`, `recommendations` desde `getRecommendations`).
- **Cliente** ([llmAssistant.client.js](../backend/src/clients/llmAssistant.client.js)):
  `fetch` nativo de Node + `AbortController` (timeout). Sin axios. Valida el shape mínimo.

### Variables de entorno

```bash
LLM_ASSISTANT_ENABLED=false
LLM_ASSISTANT_API_URL=http://localhost:5001
LLM_ASSISTANT_TIMEOUT_MS=8000
```

`LLM_ASSISTANT_ENABLED=false` por defecto: el asistente requiere Ollama + el modelo en local.
Para demo, el desarrollador pone `true`.

> **Nota de timeouts:** Express aborta a los 8s (`LLM_ASSISTANT_TIMEOUT_MS`). Ollama puede tardar
> más en la primera inferencia; si Express agota el timeout, devuelve el **fallback local**. Para
> demos con modelos lentos, sube `LLM_ASSISTANT_TIMEOUT_MS`.

## Fallback

El sistema **siempre responde 200**:
- LLM OK → `mode:"ai"` con el Markdown del asistente.
- LLM no disponible/falla, o deshabilitado → `mode:"fallback"` con recomendaciones del recomendador local.

Así la demo no se rompe aunque Ollama o el script fallen.

## Cómo probar

```bash
# 1. ai-service (terminal 1)
cd ai-service
source .venv/bin/activate
python app.py
```

Probar Flask directamente (solo local, no frontend):

```bash
curl -X POST http://localhost:5001/assistant/family-plan \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan gratis para hoy en Bilbao","familyProfile":{"childrenAges":[3],"municipality":"Bilbao"}}'
```

Probar la fachada pública Express:

```bash
# 2. backend con el asistente activado (terminal 2)
#   en backend/.env: LLM_ASSISTANT_ENABLED=true
npm run dev:backend

# 3. probar la fachada Express
curl -X POST http://localhost:3000/api/assistant/family-plan \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan gratis para hoy en Bilbao","familyProfile":{"childrenAges":[3],"municipality":"Bilbao"}}'
```

Tests backend (sin Flask ni Ollama reales, cliente mockeado):

```bash
npm run test:backend     # 10 suites · 73/73 verdes
```

## Limitaciones

- **No dockerizado todavía**: el `ai-service` necesita Ollama en el host; dockerizarlo requiere
  decidir cómo exponer Ollama al contenedor. Por eso queda fuera de esta rama.
- **Demo local, no producción**: el servicio usa `subprocess` por request y el script original
  ejecuta `eval()` sobre salida del LLM. Solo es aceptable en entorno local controlado.
- **Sin auth ni rate limiting** en el `ai-service` (no se expone; solo lo llama Express en local).
- **Latencia**: la inferencia local puede tardar; de ahí el fallback por timeout.
- **`recommendations` del LLM** llega vacío por ahora (el prototipo devuelve solo Markdown); el
  texto va en `assistantMessageMarkdown`.

## Riesgos

- 🔒 **`eval()` sobre salida del LLM** (`API_LLM_original.py`): ejecuta código Python generado por
  el modelo → riesgo de ejecución arbitraria. **Aceptable solo en local controlado** para demo.
- 🔒 **No exponer Flask al frontend ni a internet**: Express es la única fachada pública.
- El prototipo llama a APIs externas (Euskadi, Open-Meteo) y a Ollama: dependencias de red/host.

## Deuda técnica para producción

- Sustituir `eval()` por un **parser/whitelist** de operaciones pandas seguras (o un motor de
  consulta acotado).
- Aislar el `ai-service` (contenedor sin red saliente salvo lo necesario, usuario no-root).
- Auth entre Express y ai-service, rate limiting y observabilidad.
- Caché de resultados y control de coste/latencia de inferencia.
- Validación/sanitización del `message` del usuario antes de pasarlo al LLM.

## Por qué no se dockeriza todavía

Ollama corre en el host (modelos pesados, aceleración local). Dockerizar el `ai-service`
manteniendo acceso a Ollama añade complejidad (red host, `host.docker.internal`, GPU) que no
aporta a la demo. Se deja como deuda explícita.

## Por qué no se expone Flask al frontend

Para mantener **un único contrato público estable** (Express) y por seguridad: el `ai-service`
ejecuta `eval()` y no debe ser accesible desde el navegador. El frontend solo conoce
`/api/assistant/family-plan`.

## Referencias

- [ai-service/README.md](../ai-service/README.md)
- [Contrato API](api.md)
- [Integración Data Recommender](features/backend-data-recommender-primary.md) (otra integración, puerto 5000)
