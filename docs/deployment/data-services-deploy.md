# Despliegue de servicios DATA · DESAFIO-26 / pLANGUNE

Cómo añadir los servicios del equipo **Data** (recomendador y, en el futuro, chatbot) al
despliegue de pLANGUNE en el VPS, de forma **conservadora** y **sin exponerlos a Internet**.

> Estado: **Fase A (recomendador)** lista para revisar. **Fase B (chatbot + Ollama) diferida.**
> Complementa [vps-demo-deploy.md](vps-demo-deploy.md) y [../security/predeploy-checklist.md](../security/predeploy-checklist.md).
> Repos separados: el backend vive en `desafio-26-1`; Data en `Desafio-Data` (compose propio).

---

## Arquitectura

```
Internet ─443/80─> Nginx Proxy Manager ─(plangune_proxy)─> backend (Express :3000, expose)
                                                              │
                                       (red interna REAL de pLANGUNE · internal · sin Internet)
                                                              ├──> postgres :5432            (expose)
                                                              └──> data-recommender :5000     (expose)  ← Data, Fase A
                                                  [Fase B, diferida] data-chatbot :5000 ──> ollama :11434
```

- **Data NUNCA es público**: sin `ports:`, solo `expose` en la red interna de pLANGUNE.
- El backend alcanza el recomendador por **nombre de servicio**: `http://data-recommender:5000`.
- Se reutiliza la **red interna real ya creada por pLANGUNE** (no se crea ninguna red nueva,
  no se modifica el `compose.prod.yaml` de pLANGUNE).

### Hallazgos que justifican el alcance
- **Recomendador**: Flask + pandas con **CSV horneados** (≈4.274 planes), `/health` OK. Autónomo:
  sin Ollama, sin DB, sin red externa, sin secretos. → **VPS-friendly, Fase A.**
- **Chatbot**: depende de **Ollama** (`OLLAMA_HOST`, modelo tipo `qwen2.5-coder`), **pesado** en
  VPS CPU-only y **sin Dockerfile/fuente reproducible** en el repo Data. Además GUNI ya funciona
  con **Gemini cloud**. → **Fase B diferida.**

---

## Fase A — Recomendador (lista para revisar)

Archivo: **`Desafio-Data/docker-compose.data.prod.yml`** (creado). Servicio `data-recommender`,
`expose: "5000"` (sin `ports`), `image: desafio-data-recommender:prod`, healthcheck contra `/health`,
red `external: true`.

### Paso 1 · Detectar la red interna REAL de pLANGUNE (en el VPS)
```bash
sudo docker network ls | grep -E 'plangune|desafio'
sudo docker inspect plangune-backend-1 \
  --format '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}'
```
Anota el nombre de la red **interna** (la que NO da salida a Internet; normalmente la que
comparte backend ↔ postgres, no la de Nginx Proxy Manager).

### Paso 2 · Inyectar ese nombre por variable (sin editar el compose)
El compose toma la red de la variable **obligatoria** `PLANGUNE_INTERNAL_NETWORK`
(`name: ${PLANGUNE_INTERNAL_NETWORK:?...}`). En el VPS, antes de levantar Data, definirla:
```bash
# opción 1 — export en el shell
export PLANGUNE_INTERNAL_NETWORK="<NOMBRE_REAL_DETECTADO>"   # p. ej. plangune_default

# opción 2 — archivo .env local en Desafio-Data (lo lee docker compose)
echo 'PLANGUNE_INTERNAL_NETWORK=<NOMBRE_REAL_DETECTADO>' > .env
```
> `external: true` + variable obligatoria: si falta o es incorrecta, `docker compose` **falla**
> ("network not found") en vez de crear una red a ciegas. El `.env` local **NO se sube** a Git
> (ya existe `Desafio-Data/.gitignore` con `.env`; plantilla en `Desafio-Data/.env.example`).

### Paso 3 · Variables que debe añadir pLANGUNE
Documentadas en la plantilla [`backend/.env.production.example`](../../backend/.env.production.example).
En el `backend/.env.production` **real** del VPS (host, **no versionado**):
```env
DATA_RECOMMENDER_ENABLED=true            # en el .example va =false; se activa aquí manualmente
DATA_API_URL=http://data-recommender:5000
DATA_API_TIMEOUT_MS=4000
```
> `DATA_API_URL` apunta al **nombre de servicio** interno Docker (`data-recommender`): nunca IP
> pública, dominio, localhost ni puerto publicado. No requiere tocar `compose.prod.yaml`; basta
> con la variable del backend. Recrear solo el backend cuando Data ya esté arriba (Paso 4).

### Paso 4 · Comandos de despliegue propuestos (NO ejecutar aquí)
```bash
# 1) Data (recomendador) en la red interna real de pLANGUNE
cd /ruta/al/Desafio-Data
docker compose -f docker-compose.data.prod.yml up -d --build

# 2) Recoger DATA_API_URL en el backend (relee env_file al recrear el contenedor)
cd /ruta/al/desafio-26-1
docker compose -f compose.prod.yaml up -d --force-recreate backend
```

### Paso 5 · Verificación
```bash
# a) Data arriba y SANO, sin puerto público
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep data-recommender
#    → Status "Up (healthy)" y SIN "0.0.0.0:5000" (solo expose)

# b) El backend alcanza el recomendador por la red interna
docker compose -f compose.prod.yaml exec backend \
  node -e "fetch('http://data-recommender:5000/health').then(r=>r.json()).then(j=>console.log('data:',j.status,j.total)).catch(e=>{console.error('FAIL',e.message);process.exit(1)})"

# c) Por la fachada pública (debe traer planes reales de Data, no fallback local)
curl -s "https://<dominio>/api/recommendations?childrenAges=2&municipality=Bilbao" | head -c 300

# d) Data NO accesible desde fuera (debe FALLAR / timeout)
curl -s --max-time 4 "http://<dominio>:5000/health" && echo "⚠ EXPUESTO" || echo "OK: cerrado"
nmap -p 5000 <dominio>   # 5000 closed/filtered
```

### Paso 6 · Rollback
```bash
# Quitar Data sin tocar pLANGUNE (el backend vuelve a su fallback local reglado)
cd /ruta/al/Desafio-Data
docker compose -f docker-compose.data.prod.yml down

# (Opcional) desactivar Data en el backend y recrearlo
#   en backend/.env.production:  DATA_RECOMMENDER_ENABLED=false
cd /ruta/al/desafio-26-1
docker compose -f compose.prod.yaml up -d --force-recreate backend
```
> Quitar Data **no rompe** pLANGUNE: si Data no responde o está deshabilitado, el backend usa
> el **recomendador local reglado** (Family Score) como fallback. Despliegue desacoplado.

---

## Fase B — Chatbot + Ollama (DIFERIDA, no preparar aún)

No se despliega en la demo. Bloqueantes a resolver **antes** de plantearlo:
1. **Falta fuente/Dockerfile** del chatbot en el repo Data (solo queda `__pycache__` de
   `API_LLM_original_v3` + imagen pre-construida). Recuperar `app4.py` y escribir `Dockerfile.chatbot`.
2. **Ollama** como servicio interno (imagen `ollama/ollama:<versión>`, volumen para el modelo,
   `ollama pull qwen2.5-coder`). En VPS **CPU-only** las respuestas pueden tardar **10–60 s**.
3. **Recursos**: el modelo necesita varios GB de RAM. Verificar el plan del VPS.
4. **Impacto en GUNI**: la cascada es LLM-local → cloud → fallback. Un chatbot lento delante de
   **Gemini** degradaría la UX. Por eso para la demo **GUNI sigue en Gemini** (chatbot desactivado:
   no definir `LLM_ASSISTANT_ENABLED`).

Wiring futuro (referencia, no aplicar): `LLM_ASSISTANT_ENABLED=true`,
`LLM_ASSISTANT_CONTRACT=get-question`, `LLM_ASSISTANT_API_URL=http://data-chatbot:5000`,
`LLM_ASSISTANT_TIMEOUT_MS=30000`, y en el chatbot `OLLAMA_HOST=http://ollama:11434`.

---

## Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | **Repos separados** (Data ≠ backend) | Red interna real compartida (`external: true`); arrancar **Data antes** que recrear el backend. |
| R2 | Nombre de red incorrecto | `external: true` → falla en vez de crear red a ciegas; detectar con los comandos del Paso 1. |
| R3 | **CSV horneados** → datos estáticos (2026-06-02) | Rebuild de la imagen para actualizar datos; documentar la fecha del dataset. |
| R4 | DNS `data-recommender` no resuelve | Compose añade el nombre de servicio como alias en la red; alternativa: `container_name` `desafio_data_recommender`. |
| R5 | `DATA_API_TIMEOUT_MS=2000` justo en VPS | Subido a **4000** en la variable propuesta. |
| R6 | Recomendador debe escuchar en `0.0.0.0:5000` | Ya lo hace (el mapeo local funciona); confirmar en `recomendador/app.py` si se cambia. |
| R7 | Exposición accidental | Sin `ports:`; verificar con `nmap`/`ss` que `5000` no es público (Paso 5d). |

---

## Resumen operativo
1. Detectar red interna real (Paso 1).
2. Fijar `name:` en `docker-compose.data.prod.yml` (Paso 2).
3. Añadir las 3 variables al `backend/.env.production` (Paso 3).
4. `up` Data → recrear backend (Paso 4).
5. Verificar salud + no-exposición (Paso 5).
6. Rollback desacoplado disponible (Paso 6).

**No se ha ejecutado nada en el VPS. No se ha tocado `compose.prod.yaml` de pLANGUNE ni su red.**
