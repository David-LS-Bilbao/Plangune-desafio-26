import 'dotenv/config';

import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

async function start() {
  // La conexión a MongoDB está preparada pero es opcional en el bootstrap:
  // si no hay MONGODB_URI, la API arranca igual (sin features de DB todavía).
  if (process.env.MONGODB_URI) {
    try {
      await connectDB(process.env.MONGODB_URI);
    } catch {
      console.warn('Continuando sin conexión a MongoDB (modo bootstrap).');
    }
  } else {
    console.warn('MONGODB_URI no definido: la API arranca sin base de datos.');
  }

  app.listen(PORT, () => {
    console.log(`DESAFIO-26 API escuchando en http://localhost:${PORT}`);
  });
}

start();
