# Dockerfile · Frontend DESAFIO-26 (React + Vite → Nginx)
#
# Build context = ./frontend (ver compose). Multi-stage:
#   1) build: compila el bundle estático con Vite.
#   2) serve: Nginx sirve el estático y hace de reverse proxy de /api → backend.
#
# El frontend llama SIEMPRE a rutas relativas `/api` (VITE_API_URL=/api). Nginx redirige
# `/api` al backend Express por la red interna Docker: el navegador nunca habla con
# Data/Ollama/Gemini, solo con la fachada pública (Express).

# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-slim AS build

WORKDIR /app

# Dependencias primero (cache de capas). El lockfile vive en la raíz del monorepo,
# fuera de este context; usamos npm install sobre frontend/package.json (como el backend).
COPY package.json ./
RUN npm install

COPY . .

# Ruta relativa: el bundle pedirá `/api/...` al mismo origen (lo enruta Nginx).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
# Client ID de Google OAuth. Vite lo "hornea" en build time: hay que pasarlo como build-arg
# (es PÚBLICO, no un secreto: ya viaja en el bundle del navegador). Sin esto, el login con
# Google da "Error 401: invalid_client" en la imagen desplegada.
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# ── Stage 2: serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Config con fallback SPA + proxy /api → backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
