/**
 * Seed Prisma (MVP) · DESAFIO-26
 *
 * Inserta en PostgreSQL los mismos eventos que el mock en memoria
 * (`backend/src/seed/mockEvents.js`), reutilizando esos datos para no duplicar.
 * El shape del mock coincide 1:1 con el modelo `Event` (tabla `events` de init.sql).
 *
 * - Idempotente: usa `upsert` por `id`, así que se puede ejecutar varias veces.
 *
 * IMPORTANTE: este seed todavía NO se usa en runtime. Los services siguen usando
 * memoria/mock. Ejecutarlo requiere una DB local disponible (ver docs/database.md).
 *
 * Ejecución (con DB local levantada y cliente Prisma generado):
 *   node prisma/seed.js            # desde el workspace backend
 */
import { PrismaClient } from '@prisma/client';

import { mockEvents } from '../src/seed/mockEvents.js';

const prisma = new PrismaClient();

/** Upsert idempotente de cada evento mock. */
async function seedEvents() {
  for (const { id, ...data } of mockEvents) {
    await prisma.event.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }
  return mockEvents.length;
}

async function main() {
  // Orquesta el seed para mantener el manejo de errores en un único punto.
  const count = await seedEvents();
  console.log(`✅ Seed completado: ${count} eventos (upsert idempotente).`);
}

main()
  .catch((error) => {
    console.error('❌ Error en el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
