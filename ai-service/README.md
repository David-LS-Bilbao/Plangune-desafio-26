# ai-service · Asistente LLM local (demo) · DESAFIO-26

Servicio **Python/Flask** que envuelve el prototipo de recomendación conversacional (Ollama +
API de eventos de Euskadi + Open-Meteo). Es la pieza `ai-service` de la arquitectura:

```
Frontend React → Backend Express → ai-service Flask (:5001) → Ollama / API Euskadi / Open-Meteo
```

> ⚠️ **Solo para demo en entorno local controlado.** El script `API_LLM_original.py` ejecuta
> `eval()` sobre código generado por el LLM. **No** usar en producción, **no** exponer a internet,
> **no** conectar el frontend directamente a este servicio (la fachada pública es Express).

## Requisitos

- Python 3.10+
- [Ollama](https://ollama.com) instalado y corriendo en local.
- Modelo `qwen2.5-coder:latest` descargado.

## Puesta en marcha

```bash
cd ai-service

# 1. Entorno virtual
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Dependencias
pip install -r requirements.txt

# 3. Modelo de Ollama (requiere Ollama instalado y en marcha)
ollama pull qwen2.5-coder:latest

# 4. Arrancar el servicio (puerto 5001)
python app.py
```

El servicio queda en `http://localhost:5001`.

> ⚠️ **Windows — arráncalo siempre con el `.venv` y con UTF-8.** Si lo lanzas con el Python
> global (sin `pandas`) o sin forzar UTF-8, el subprocess interno falla y la respuesta cae
> siempre en `mode: "fallback"`. Desde `ai-service/` en PowerShell:
>
> ```powershell
> $env:PYTHONUTF8 = "1"
> .\.venv\Scripts\python.exe app.py
> ```
>
> (Desde la app, `app.py` ya fuerza UTF-8 en el subprocess; la variable es el cinturón de
> seguridad si ejecutas `API_LLM_original.py` a mano.)

## Endpoints

### `GET /health`

```bash
curl http://localhost:5001/health
```

```json
{ "status": "ok", "service": "llm-local-assistant" }
```

### `POST /assistant/family-plan`

```bash
curl -X POST http://localhost:5001/assistant/family-plan \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Plan gratis para hoy en Bilbao",
    "familyProfile": { "childrenAges": [3], "municipality": "Bilbao" }
  }'
```

Respuesta correcta (`mode: "ai"`):

```json
{
  "mode": "ai",
  "source": "llm-local",
  "assistantMessageMarkdown": "## 🎭 ...markdown generado...",
  "recommendations": []
}
```

Respuesta de fallback (sin resultados / error / timeout):

```json
{
  "mode": "fallback",
  "source": "llm-local",
  "assistantMessageMarkdown": "Lo sentimos, no hemos encontrado planes que encajen con tu búsqueda. Prueba con otra zona, fecha o presupuesto.",
  "recommendations": []
}
```

## Cómo funciona

1. `app.py` recibe el `message` del usuario.
2. Ejecuta `API_LLM_original.py` con `subprocess` usando `sys.executable` y pasándole el mensaje
   como argumento, con **timeout** (`AI_SCRIPT_TIMEOUT_SECONDS`, por defecto 120s).
3. El script pregunta a Ollama (`qwen2.5-coder:latest`), genera un filtro pandas, lo aplica sobre
   los eventos de Euskadi (enriquecidos con el tiempo de Open-Meteo) y **imprime Markdown**.
4. `app.py` devuelve ese Markdown como `assistantMessageMarkdown` (`mode: "ai"`).
5. Si el stdout viene vacío, el subprocess falla o se agota el timeout → **fallback JSON amable**
   (no se devuelven trazas internas al cliente).

## Notas de seguridad y deuda técnica

- **`eval()` sobre salida del LLM** en `API_LLM_original.py`: riesgo de ejecución de código
  arbitrario. Aceptable solo en local controlado para demo. Para producción habría que sustituir
  `eval` por un parser/whitelist de operaciones pandas seguras.
- Sin auth ni rate limiting (no es necesario en local; sí lo sería si se expusiera).
- No dockerizado todavía (requiere Ollama en el host).
- El frontend no llama a este servicio: la única API pública es Express.

## Problemas frecuentes

- **Siempre responde `mode: "fallback"`**: casi siempre es uno de estos dos en Windows:
  1. El servidor se arrancó con el **Python global** (sin `pandas`): `ModuleNotFoundError: No module
     named 'pandas'`. Arráncalo con el `.venv` (`.\.venv\Scripts\python.exe app.py`).
  2. **`UnicodeEncodeError`** al imprimir los emojis del Markdown (codec `cp1252`). Arranca con
     `$env:PYTHONUTF8 = "1"`. El código ya lo fuerza, pero la variable es la red de seguridad.
  Para diagnosticar, ejecuta el script a mano: `.\.venv\Scripts\python.exe API_LLM_original.py "Plan gratis en Bilbao"`.
- **Ollama no está arrancado**: inicia Ollama en el host y repite la petición.
- **Modelo no descargado**: ejecuta `ollama pull qwen2.5-coder:latest`.
- **Timeout**: la primera inferencia puede tardar; sube `AI_SCRIPT_TIMEOUT_SECONDS` para Flask o
  `LLM_ASSISTANT_TIMEOUT_MS` en Express durante la demo.
- **API Euskadi u Open-Meteo no responde**: el prototipo puede devolver fallback aunque Flask esté vivo.
- **Puerto 5001 ocupado**: libera el proceso que lo usa o cambia el puerto y actualiza
  `LLM_ASSISTANT_API_URL` en `backend/.env`.

Ver la integración completa en [../docs/integration-ai-ollama-local.md](../docs/integration-ai-ollama-local.md).
