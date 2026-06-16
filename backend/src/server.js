import 'dotenv/config';

import { validateEnv } from './config/env.js';
import { createApp } from './app.js';

// Falla pronto (antes de escuchar) si la configuración de producción es insegura:
// JWT_SECRET ausente/débil, DATABASE_URL o CLIENT_URL ausentes. Evita arrancar en un
// estado que provoque 500 en runtime (p. ej. crear un usuario y luego no poder firmar
// el JWT por falta de secreto válido).
try {
  validateEnv();
} catch (err) {
  // Mensaje claro, sin stacktrace ni secretos. No se levanta el servidor.
  console.error(`\n[DESAFIO-26] No se puede arrancar: ${err.message}\n`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const app = createApp();

// El healthcheck no requiere base de datos. La conexión a PostgreSQL vía Prisma
// (src/config/prisma.js) se establecerá de forma perezosa cuando lleguen features.
app.listen(PORT, () => {
  console.log(`DESAFIO-26 API escuchando en http://localhost:${PORT}`);
});
