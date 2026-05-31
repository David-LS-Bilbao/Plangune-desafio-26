import 'dotenv/config';

import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

// El healthcheck no requiere base de datos. La conexión a PostgreSQL vía Prisma
// (src/config/prisma.js) se establecerá de forma perezosa cuando lleguen features.
app.listen(PORT, () => {
  console.log(`DESAFIO-26 API escuchando en http://localhost:${PORT}`);
});
