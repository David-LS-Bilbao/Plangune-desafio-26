# Dockerfile · Data Recommender (Flask + SentenceTransformers · DESAFIO-26 / pLANGUNE)
#
# Build context = ./data  (ver compose.yaml / compose.data.prod.yaml).
# Copia el código del recomendador y los datasets compartidos preservando el layout
# que espera config.py: ROOT_DIR/data para eventos.db + embeddings.
#
# Servicio INTERNO: no se publica a internet (solo lo alcanza el backend por la red Docker).
# Autónomo en runtime: usa embeddings y SQLite locales; no llama a APIs externas.

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface

# config.py calcula ROOT_DIR = BASE_DIR.parent.parent. Con el código en
# /app/svc/recommender, ROOT_DIR = /app y DATA_DIR = /app/data.
WORKDIR /app/svc/recommender

# 1) Dependencias primero (mejor cache de capas). Torch CPU-only para no arrastrar CUDA (~2GB).
COPY recommender/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt gunicorn

# 2) Pre-descargar el modelo e5-large en BUILD → arranque rápido y sin red en runtime.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('intfloat/multilingual-e5-large')"

# 3) Código del recomendador (incluye wsgi.py de orquestación).
COPY recommender/ ./

# 4) Datasets compartidos (eventos.db + embeddings) en /app/data, donde los busca config.py.
COPY datasets/ /app/data/

EXPOSE 5000

# 1 worker: el modelo (~2GB) vive en RAM una sola vez. timeout alto para el primer encode.
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "wsgi:app"]
