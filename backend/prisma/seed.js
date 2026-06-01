/**
 * Seed Prisma (MVP) · DESAFIO-26
 *
 * Inserta en PostgreSQL las mismas actividades que el mock en memoria
 * (`backend/src/seed/mockActivities.js`), reutilizando esos datos para no duplicar.
 *
 * - Idempotente: usa `upsert` por `id`, así que se puede ejecutar varias veces.
 * - Conserva los IDs legibles (`act-001`, ...) y la actividad `pending`,
 *   manteniendo la misma lógica de filtrado que el MVP.
 *
 * IMPORTANTE: este seed todavía NO se usa en runtime. Los services siguen usando
 * memoria/mock. Ejecutarlo requiere una DB local disponible (ver docs/database.md).
 *
 * Ejecución (con DB local levantada y cliente Prisma generado):
 *   node prisma/seed.js            # desde el workspace backend
 */
import { PrismaClient } from '@prisma/client';

import { mockActivities } from '../src/seed/mockActivities.js';

const prisma = new PrismaClient();

/** Upsert idempotente de cada actividad mock. */
async function seedActivities() {
  for (const { id, ...data } of mockActivities) {
    await prisma.activity.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }
  return mockActivities.length;
}

async function main() {
  const count = await seedActivities();
  console.log(`✅ Seed completado: ${count} actividades (upsert idempotente).`);
}

main()
  .catch((error) => {
    console.error('❌ Error en el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
