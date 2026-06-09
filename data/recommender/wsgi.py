"""
Entrypoint WSGI para gunicorn.

Inicializa el recomendador (embeddings + modelo SentenceTransformer) UNA sola vez
al importar el módulo, y expone `app` para gunicorn. El modelo de ~2 GB se carga en
memoria aquí, antes de aceptar peticiones, por eso el healthcheck usa un start_period
generoso (ver compose).

No modifica el código original de Data (app.py): solo orquesta su arranque en producción.
"""
import app as recommender_app

# Carga embeddings + modelo (lazy interno, idempotente).
recommender_app.init()

# WSGI callable que sirve gunicorn.
app = recommender_app.app
