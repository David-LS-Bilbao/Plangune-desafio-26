# Con AirPlay desactivado (puertos por defecto)
docker compose up -d --build

# Con AirPlay activo (override macOS)
docker compose -f compose.yaml -f compose.local-override.yaml up -d --build

docker compose ps
# Esperar a que data-recommender pase a "healthy" (~1-3 min)


# ai-service (LLM local / GUNI) — necesario para el chat con Ollama, puerto 5001.
# Requisitos: Ollama corriendo + `ollama pull qwen2.5-coder:latest` + venv con deps.
# Windows (PowerShell), desde ai-service/:
#   $env:PYTHONUTF8 = "1"; .\.venv\Scripts\python.exe app.py
# Sin PYTHONUTF8 o con el Python global (sin pandas) → el chat cae siempre en "fallback".
curl http://localhost:5001/health
# Backend en Docker llega al host vía LLM_ASSISTANT_API_URL=http://host.docker.internal:5001

# Backend vivo
curl http://localhost:3000/api/health

# Recomendador con datos reales
curl "http://localhost:3000/api/recommendations?childrenAges=2&municipality=Bilbao"

# App completa en el navegador
open http://localhost:8080   # sin override
open http://localhost:8081   # con override


docker compose down                  # para y elimina contenedores
docker compose down -v               # también elimina volúmenes (resetea la DB)