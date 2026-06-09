"""
ai-service · Asistente LLM local (demo) · DESAFIO-26

Fachada Flask que envuelve el prototipo de Danilo (API_LLM_original.py) para que el
backend Express lo consuma. NO se expone al frontend (Express es la única fachada pública).

- Puerto 5001 (el 5000 queda reservado para la Data API /planes).
- GET  /health
- POST /assistant/family-plan

⚠️ SEGURIDAD: API_LLM_original.py ejecuta `eval()` sobre código generado por el LLM.
   Es SOLO para demo en entorno local controlado. NO usar en producción ni exponer a internet.
"""
import os
import subprocess
import sys

from flask import Flask, jsonify, request

app = Flask(__name__)

# Ruta del script LLM, relativa a este archivo (robusto ante el cwd de arranque).
SCRIPT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "API_LLM_original.py")

# Timeout del subprocess (Ollama puede tardar). Configurable por entorno.
SCRIPT_TIMEOUT_SECONDS = int(os.environ.get("AI_SCRIPT_TIMEOUT_SECONDS", "120"))

# Mensaje de fallback amable (sin filtrar detalles internos al cliente).
FALLBACK_MESSAGE = (
    "Lo sentimos, no hemos encontrado planes que encajen con tu búsqueda. "
    "Prueba con otra zona, fecha o presupuesto."
)


def _fallback_response():
    """Respuesta JSON de fallback (sin trazas internas)."""
    return jsonify(
        {
            "mode": "fallback",
            "source": "llm-local",
            "assistantMessageMarkdown": FALLBACK_MESSAGE,
            "recommendations": [],
        }
    )


def run_llm_script(question: str) -> str | None:
    """
    Ejecuta API_LLM_original.py pasando la pregunta del usuario como argumento.
    Usa sys.executable (el mismo intérprete del venv). Devuelve el stdout (Markdown)
    o None si falla / timeout / stdout vacío.

    El Markdown lleva emojis (🎭, 📅, …). En Windows la consola por defecto usa cp1252
    y `print()` lanzaría UnicodeEncodeError → returncode != 0 → fallback. Forzamos UTF-8
    en el subprocess (encoding del pipe + PYTHONUTF8/PYTHONIOENCODING en el hijo) para que
    funcione independientemente de cómo se haya arrancado este servidor.
    """
    child_env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"}
    try:
        result = subprocess.run(
            [sys.executable, SCRIPT_PATH, question],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env=child_env,
            timeout=SCRIPT_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return None
    except Exception:
        return None

    if result.returncode != 0:
        return None

    output = (result.stdout or "").strip()
    return output or None


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "llm-local-assistant"})


@app.route("/assistant/family-plan", methods=["POST"])
def family_plan():
    data = request.get_json(silent=True) or {}
    message = data.get("message")

    # Sin mensaje válido → fallback amable.
    if not isinstance(message, str) or not message.strip():
        return _fallback_response()

    output = run_llm_script(message.strip())

    # stdout vacío / error / timeout → fallback.
    if not output:
        return _fallback_response()

    return jsonify(
        {
            "mode": "ai",
            "source": "llm-local",
            "assistantMessageMarkdown": output,
            "recommendations": [],
        }
    )


if __name__ == "__main__":
    print("🚀 ai-service (LLM local) escuchando en http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
