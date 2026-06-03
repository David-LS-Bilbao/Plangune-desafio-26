# Dockerfile · Backend DESAFIO-26 (API Express + Prisma)
#
# Build context = ./backend (ver compose.yaml).
# Arranca con `node src/server.js` (NO nodemon): el contenedor es para validación
# reproducible, no para hot-reload. El desarrollo con recarga vive en el host
# (`npm run dev:backend`). Ver docs/docker-backend.md.

FROM node:20-slim

# Prisma necesita openssl presente en la imagen (Debian slim no lo trae por defecto).
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Dependencias primero (mejor cache de capas). No hay lockfile propio del workspace
#    backend, así que usamos `npm install` sobre backend/package.json.
COPY package.json ./
RUN npm install

# 2) Código de la aplicación (incluye prisma/schema.prisma y prisma/migrations).
COPY . .

# 3) Generar Prisma Client para la plataforma del contenedor (Linux), no la del host.
RUN npx prisma generate

EXPOSE 3000

# Server simple (sin nodemon). Las migraciones/seed se ejecutan aparte (ver docs).
CMD ["node", "src/server.js"]
