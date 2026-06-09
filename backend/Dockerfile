# Dockerfile · Backend DESAFIO-26 (API Express + Prisma)
#
# Build context = ./backend (ver compose.yaml / compose.prod.yaml).
# Arranca con `node src/server.js` (NO nodemon): el contenedor es para validación
# reproducible / producción, no para hot-reload. El desarrollo con recarga vive en el
# host (`npm run dev:backend`). Ver docs/docker-backend.md.
#
# Endurecido para producción:
#   - Imagen con versión concreta (no `latest`).
#   - Corre como usuario NO root (`node`, uid 1000, ya presente en la imagen oficial).
#   - `.env` excluido del build vía .dockerignore (nunca se hornea en la imagen).

FROM node:20-slim

# Prisma necesita openssl (Debian slim no lo trae). Se instala como root ANTES de bajar
# privilegios. ca-certificates para llamadas HTTPS salientes (p. ej. proveedor cloud).
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# /app pasa a ser propiedad de `node` para instalar deps y generar el cliente Prisma sin root.
RUN chown node:node /app

# 1) Dependencias primero (mejor cache de capas). El monorepo mantiene el lockfile en la
#    RAÍZ, fuera de este build context (./backend), así que aquí usamos `npm install` sobre
#    backend/package.json. TODO(prod reproducible): si se hornea un lockfile en backend/,
#    cambiar a `npm ci`. Ver informe de hardening.
COPY --chown=node:node package.json ./

# A partir de aquí, todo como usuario no privilegiado.
USER node
RUN npm install

# 2) Código de la aplicación (incluye prisma/schema.prisma y prisma/migrations).
#    `.dockerignore` excluye .env, node_modules, .git, coverage...
COPY --chown=node:node . .

# 3) Generar Prisma Client para la plataforma del contenedor (Linux), no la del host.
RUN npx prisma generate

EXPOSE 3000

# Server simple (sin nodemon). Las migraciones/seed se ejecutan aparte (ver docs).
CMD ["node", "src/server.js"]
