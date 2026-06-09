# Dockerfile · Data Chatbot GUNI (Flask + Ollama · DESAFIO-26 / pLANGUNE)
#
# Build context = ./data (ver compose). Sirve `GET /<pregunta>` → Markdown.
# app5.py lanza por subprocess `API_LLM_original_v4.py`, que:
#   - consulta el LLM local vía Ollama (OLLAMA_HOST, modelo qwen2.5-coder),
#   - llama a APIs externas (api.euskadi.eus, open-meteo) → requiere salida a internet,
#   - cachea en events_weather.csv.
#
# Ollama NO va dentro de este contenedor: se consume desde el servicio `ollama`.
# Servicio INTERNO: no se publica a internet. El backend lo alcanza por nombre de servicio.
#
# AVISO DE SEGURIDAD: el script original usa eval() sobre código generado por el LLM
# (riesgo conocido del repo Data). Por eso el chat va detrás de un profile opt-in y GUNI
# usa Gemini por defecto. No habilitar en entornos sensibles sin sanear el eval().

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    OLLAMA_HOST=http://ollama:11434 \
    APP_ENTRYPOINT=app5.py

WORKDIR /app/svc/chatbot

# Dependencias primero (cache de capas).
COPY chatbot/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Código del chatbot (app5.py + API_LLM_original_v4.py que invoca por subprocess).
COPY chatbot/ ./

# Flask escucha internamente en 5000 (app5.py).
EXPOSE 5000

CMD ["sh", "-c", "python ${APP_ENTRYPOINT:-app5.py}"]
