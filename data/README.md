# Servicios Data · DESAFIO-26 / pLANGUNE

Servicios del equipo **Data** (repo origen: `urkomen/Desafio-Data`) integrados en el monorepo
principal para poder orquestar **toda la app con un solo `docker compose`**. Aquí viven el
**recomendador** y el **chatbot GUNI**; el backend Express los consume por la red interna Docker.

> El **frontend nunca** llama a estos servicios. La única fachada pública es el backend Express.
> Estos servicios **no se publican a internet** (en producción solo `expose`, sin `ports`).

## Estructura

```
data/
├── datasets/                     # datos compartidos (versionados; ~18 MB, sin Git LFS)
│   ├── eventos.db                # SQLite: eventos, familias, favoritos, historial
│   └── embeddings/
│       ├── embeddings.npy        # matriz e5-large normalizada (16 MB)
│       └── embeddings_index.csv  # id de evento → fila en la matriz
├── recommender/                  # API Flask de recomendación (POST /recomendar)
│   ├── app.py · config.py · data_access.py · recommender.py · location.py
│   ├── wsgi.py                   # entrypoint gunicorn (carga modelo una vez)
│   ├── requirements.txt
│   └── Dockerfile
├── chatbot/                      # API Flask del chatbot GUNI (GET /<pregunta>)
│   ├── app5.py · API_LLM_original_v4.py
│   ├── requirements.txt
│   └── Dockerfile
└── .dockerignore
```

Los archivos de código y datos provienen de `urkomen/Desafio-Data`. Solo se añadió `wsgi.py`
(orquestación de arranque en producción) y los `Dockerfile`; **el código original no se modifica**.

## Cómo levantar todo (desde la raíz del repo)

```bash
# Stack completo: postgres + backend + frontend + data-recommender
docker compose up -d --build
# Abre la app en:  http://localhost:8080
```

> ⚠️ **Primer build del recomendador**: descarga PyTorch (CPU) + el modelo `intfloat/multilingual-e5-large`
> (~2 GB) y lo hornea en la imagen, así que la primera vez **tarda varios minutos** y la imagen es
> grande. Builds posteriores usan caché. Tras arrancar, el contenedor aún tarda ~30–60 s en cargar
> el modelo en memoria antes de responder `/health` (por eso el healthcheck tiene `start_period` alto).

### Chat GUNI con LLM local (opt-in, PESADO)

```bash
docker compose --profile chat up -d --build
# Descargar el modelo una sola vez (queda en un volumen):
docker compose exec ollama ollama pull qwen2.5-coder:latest
# Activar el chatbot en el backend (backend/.env):
#   LLM_ASSISTANT_ENABLED=true
#   LLM_ASSISTANT_CONTRACT=get-question
#   LLM_ASSISTANT_API_URL=http://data-chatbot:5000
# y recrear el backend:  docker compose up -d backend
```

Si no activas el profile `chat`, GUNI usa la cascada del backend (cloud Gemini si está
configurado, o el fallback local sin IA). La app sigue siendo plenamente funcional sin el chat.

## Contratos

### Recomendador — `POST /recomendar`

```jsonc
// Petición (la construye el backend desde los filtros de /api/recommendations)
{
  "id_user": 0,                                  // 0 = sesión anónima (sin auth)
  "consulta": "Bilbao planes para niños de 2 años",
  "filtros": { "carrito": true, "interior": true, "gratis": false }
}
// Respuesta
{ "user_id": 0, "municipio": "Bilbao", "fallback": false, "n_candidatos": 12,
  "resultados": [ { "id": 101, "title": "...", "municipio": "...", "price": "...", "score": 0.82 } ] }
```

- `GET /health` → `{ "status": "ok", "n_eventos": N }`.
- El municipio se **extrae del texto** de `consulta` (no es un parámetro aparte).
- `id_user` que no existe en la DB es seguro: degrada a recomendación **semántica pura**.

Mapeo de filtros (backend → Data): `strollerFriendly→carrito`, `changingTable→cambiador`,
`rainSuitable→interior`, `wheelchairAccessible→accesible`, `petsAllowed→mascota`, `budget=0→gratis`.

### Chatbot — `GET /<pregunta>`

Devuelve Markdown. Internamente consulta el LLM (Ollama, `qwen2.5-coder`) y APIs externas
(`api.euskadi.eus`, `open-meteo`). Si falla, responde un cuerpo que empieza por `ERROR:`, que el
backend trata como fallo para caer al fallback.

## Avisos y limitaciones

- **Datasets estáticos** (snapshot `events_2026-06-02`). Para actualizar, regenerar en el repo Data
  y volver a copiar `data/datasets/` + rebuild de la imagen.
- **Recomendador**: autónomo en runtime (no usa internet); imagen grande por el modelo e5-large.
- **Chatbot**: necesita **salida a internet** y **Ollama** (varios GB de RAM). En producción va en
  red propia (ver `compose.data.prod.yaml`), nunca en la red `internal: true` del recomendador.
- **Seguridad (chatbot)**: el script usa `eval()` sobre código generado por el LLM (riesgo conocido
  del repo Data). Por eso el chat es opt-in y no se expone a internet. No habilitar en entornos
  sensibles sin sanear ese `eval()`.

## Producción

- `compose.prod.yaml` levanta `frontend` + `backend` + `postgres` + `data-recommender` con la
  topología segura (redes internas, sin puertos públicos; NPM como único entrante).
- `compose.data.prod.yaml` es el overlay opcional del chat (chatbot + Ollama) en red con internet.

Ver [../docs/deployment/data-services-deploy.md](../docs/deployment/data-services-deploy.md).
