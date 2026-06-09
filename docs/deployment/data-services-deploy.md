# Despliegue de servicios DATA · DESAFIO-26 / pLANGUNE

Los servicios del equipo **Data** (recomendador y chatbot GUNI) viven ahora **dentro del repo
principal**, en [`data/`](../../data/README.md), para poder orquestar **toda la app** (frontend +
backend + PostgreSQL + Data) con un solo `docker compose`, **sin exponer Data a Internet** y
manteniendo los servicios **separados** (Data nunca va dentro del contenedor backend).

> Origen del código/datos: `urkomen/Desafio-Data` (copiado, no modificado). Solo se añadieron los
> `Dockerfile` y `wsgi.py` de orquestación.
> Complementa [vps-demo-deploy.md](vps-demo-deploy.md) y [../security/predeploy-checklist.md](../security/predeploy-checklist.md).

---

## Arquitectura

```
Internet ─443/80─> Nginx Proxy Manager ─(plangune_proxy)─> frontend (Nginx :80, expose)
                                                              │  /api → reverse proxy
                                                              ▼
                                       (red interna REAL · plangune_internal · sin Internet)
                                                              ├──> backend (Express :3000, expose)
                                                              │       ├──> postgres :5432       (expose)
                                                              │       └──> data-recommender :5000 (expose)
                                                              │
                          [overlay chat, red CON internet]   └··> data-chatbot :5000 ──> ollama :11434
```

- **Data NUNCA es público**: sin `ports:` en producción, solo `expose` en la red interna.
- El backend alcanza el recomendador por **nombre de servicio**: `http://data-recommender:5000`.
- El **recomendador** es autónomo (embeddings + SQLite locales) → compatible con `internal: true`.
- El **chatbot** necesita salida a Internet (`api.euskadi.eus`, `open-meteo`) y Ollama → vive en una
  **red propia con internet** (`compose.data.prod.yaml`), nunca en la red `internal: true`.

### Hallazgos que justifican el alcance
- **Recomendador**: Flask + `sentence-transformers` (modelo `multilingual-e5-large`, ~2 GB horneado
  en la imagen) sobre `eventos.db` + `embeddings.npy`. Contrato `POST /recomendar`. Autónomo: sin
  Ollama, sin red externa, sin secretos. → **Activo por defecto.**
- **Chatbot**: depende de **Ollama** (`qwen2.5-coder`), llama a APIs externas y usa `eval()` sobre
  código generado por el LLM (riesgo). Pesado en VPS CPU-only. GUNI ya funciona con **Gemini cloud**.
  → **Overlay opcional (profile `chat`), diferido en la demo.**

---

## Contrato real del recomendador (importante)

`POST {DATA_API_URL}/recomendar`

```jsonc
{ "id_user": 0, "consulta": "Bilbao planes para niños de 2 años",
  "filtros": { "carrito": true, "interior": false, "gratis": false } }
```

- El backend construye `consulta` (municipio + edades) y `filtros` desde los params de
  `/api/recommendations`. El recomendador **extrae el municipio del texto** de `consulta`.
- `id_user=0` = sesión anónima (sin auth): Data degrada a recomendación semántica pura, sin error.
- `GET /health` → `{ status, n_eventos }`.

Variables del backend (ver [`backend/.env.production.example`](../../backend/.env.production.example)):

```env
DATA_RECOMMENDER_ENABLED=true
DATA_API_URL=http://data-recommender:5000
DATA_API_TIMEOUT_MS=4000
DATA_USER_ID=0
```

Si Data está deshabilitado, falla, agota timeout o no devuelve resultados → **fallback local reglado**
(Family Score sobre Prisma/PostgreSQL). El despliegue queda **desacoplado**: quitar Data no rompe nada.

---

## Desarrollo local (stack completo)

```bash
docker compose up -d --build      # postgres + backend + frontend + data-recommender
# App en http://localhost:8080
```

Chat GUNI con LLM local (opt-in, pesado): ver [`data/README.md`](../../data/README.md).

---

## Producción (VPS)

### 1 · Preparación (una vez)
```bash
docker network create plangune_proxy           # red compartida con Nginx Proxy Manager
cp backend/.env.example backend/.env.production # rellenar secretos REALES (JWT_SECRET, etc.)
# exportar credenciales de Postgres (POSTGRES_DB/USER/PASSWORD) en un .env junto al compose
```

### 2 · Levantar el stack principal (con recomendador)
```bash
docker compose -f compose.prod.yaml up -d --build
```
Esto levanta `frontend` + `backend` + `postgres` + `data-recommender` en la topología segura
(redes internas, sin puertos públicos; NPM enruta al `frontend`, que proxya `/api` al backend).

### 3 · Verificación
```bash
# a) Recomendador SANO y SIN puerto público
docker compose -f compose.prod.yaml ps data-recommender   # healthy, sin 0.0.0.0:5000

# b) El backend alcanza el recomendador por la red interna
docker compose -f compose.prod.yaml exec backend \
  node -e "fetch('http://data-recommender:5000/health').then(r=>r.json()).then(j=>console.log('data:',j.status,j.n_eventos)).catch(e=>{console.error('FAIL',e.message);process.exit(1)})"

# c) Por la fachada pública (planes reales de Data, no fallback)
curl -s "https://<dominio>/api/recommendations?childrenAges=2&municipality=Bilbao" | head -c 300

# d) Data NO accesible desde fuera (debe FALLAR)
curl -s --max-time 4 "http://<dominio>:5000/health" && echo "⚠ EXPUESTO" || echo "OK: cerrado"
```

### 4 · Chat GUNI en el VPS (overlay opcional, diferido)
```bash
# Detectar el nombre real de la red interna de pLANGUNE y exportarlo:
export PLANGUNE_INTERNAL_NETWORK="<nombre_real>"   # docker network ls | grep plangune
docker compose -f compose.data.prod.yaml up -d --build
docker compose -f compose.data.prod.yaml exec ollama ollama pull qwen2.5-coder:latest
# En backend/.env.production: LLM_ASSISTANT_ENABLED=true, LLM_ASSISTANT_CONTRACT=get-question,
#   LLM_ASSISTANT_API_URL=http://data-chatbot:5000 ; luego recrear el backend.
```

### 5 · Rollback desacoplado
```bash
# Quitar el chat sin tocar el stack principal
docker compose -f compose.data.prod.yaml down
# Desactivar Data recommender: en backend/.env.production DATA_RECOMMENDER_ENABLED=false
docker compose -f compose.prod.yaml up -d --force-recreate backend  # vuelve al fallback local
```

---

## Riesgos

| # | Prioridad | Riesgo | Mitigación |
|---|---|---|---|
| R1 | P1 | Imagen del recomendador grande (~modelo e5-large 2 GB) y build lento | Modelo horneado en build (offline en runtime); torch CPU-only; documentar primer build. |
| R2 | P1 | Carga del modelo ~30–60 s tras arrancar | `start_period: 180s` en el healthcheck; el backend usa `service_started` (no bloquea) + fallback. |
| R3 | P1 | Chatbot necesita Internet y Ollama (CPU-only lento, varios GB RAM) | Overlay aparte (`compose.data.prod.yaml`) en red con internet; diferido en la demo (GUNI = Gemini). |
| R4 | **P0** | Chatbot usa `eval()` sobre output del LLM | No exponer a internet; profile opt-in; sanear el `eval()` antes de habilitar en serio. |
| R5 | P1 | Nombre de red interna distinto en el VPS | `compose.data.prod.yaml` usa `external: true` + `PLANGUNE_INTERNAL_NETWORK` (falla claro si no existe). |
| R6 | P2 | Datasets estáticos (snapshot 2026-06-02) | Regenerar en el repo Data y volver a copiar `data/datasets/` + rebuild. |
| R7 | P2 | Escala del `score` de Data (coseno) ≠ score local | El frontend usa etiqueta amable, no el número; sin impacto visible. |

---

## Resumen operativo
1. `docker compose up -d --build` levanta toda la app en local (http://localhost:8080).
2. En el VPS, `compose.prod.yaml` levanta frontend + backend + postgres + recomendador.
3. El chat (chatbot + Ollama) es un overlay opcional `compose.data.prod.yaml`, diferido en la demo.
4. Quitar Data nunca rompe pLANGUNE: el backend cae al recomendador local reglado.
