/**
 * Seed de desarrollo · DESAFIO-26
 *
 * Pobla la DB local con datos de prueba suficientes para demostrar los endpoints.
 * Solo para desarrollo/demo local. NO usar contra entornos compartidos o producción.
 *
 * Orden de ejecución:
 *   1. seedUsers()      — 5 usuarios demo 'business' (IDs 1–5) + 1 usuario 'family' (ID 100)
 *   2. seedBusinesses() — 5 negocios demo vinculados a esos usuarios (IDs explícitos 1–5)
 *   3. seedEvents()     — eventos de mockEvents.js (IDs explícitos del mock)
 *   4. syncSequences()  — resincroniza las secuencias SERIAL para evitar choques
 *                         en futuros inserts sin ID explícito
 *
 * Todos los upserts son idempotentes: puede ejecutarse varias veces sin duplicar.
 *
 * Ejecución (requiere DB local levantada y cliente Prisma generado):
 *   npm run db:seed --workspace backend
 *   # o bien: node prisma/seed.js   (desde backend/)
 */
import { PrismaClient } from '@prisma/client';

import { mockEvents } from '../src/seed/mockEvents.js';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Datos demo (inline — no se duplican en otros archivos)
// ---------------------------------------------------------------------------

/** 5 usuarios demo de tipo 'business'. Passwords son placeholders, no hashes reales. */
const demoUsers = [
  { id: 1, email: 'negocio1@demo.eus', password: 'seed-demo-no-real-1', role: 'business' },
  { id: 2, email: 'negocio2@demo.eus', password: 'seed-demo-no-real-2', role: 'business' },
  { id: 3, email: 'negocio3@demo.eus', password: 'seed-demo-no-real-3', role: 'business' },
  { id: 4, email: 'negocio4@demo.eus', password: 'seed-demo-no-real-4', role: 'business' },
  { id: 5, email: 'negocio5@demo.eus', password: 'seed-demo-no-real-5', role: 'business' },
];

/**
 * Usuario family demo (ID 100) para favoritos mientras no exista auth.
 * Lo usa favorite.service.js como MOCK_FAMILY_USER_ID. No es un negocio (1–5).
 */
const demoFamilyUser = {
  id: 100,
  email: 'familia@demo.eus',
  password: 'seed-demo-no-real-family',
  role: 'family',
};

/** 5 negocios demo. IDs 1–5 coinciden con los business_id referenciados por mockEvents. */
const demoBusinesses = [
  { id: 1, user_id: 1, name: 'Negocio Demo 1 (museo Bilbao)', nif: 'B00000001' },
  { id: 2, user_id: 2, name: 'Negocio Demo 2 (taller Bilbao)', nif: 'B00000002' },
  { id: 3, user_id: 3, name: 'Negocio Demo 3 (acuario Donostia)', nif: 'B00000003' },
  { id: 4, user_id: 4, name: 'Negocio Demo 4 (teatro Vitoria)', nif: 'B00000004' },
  { id: 5, user_id: 5, name: 'Negocio Demo 5 (granja Karrantza)', nif: 'B00000005' },
];

// ---------------------------------------------------------------------------
// Helper de conversión de fechas
// ---------------------------------------------------------------------------

/**
 * Prepara un evento mock para insertar en Prisma.
 * Convierte strings ISO sin timezone a objetos Date que Prisma acepta.
 * lat/lng/edad_minima/multiplicador son números JS: Prisma los acepta como Decimal.
 */
function prepareEventForPrisma({ fecha_inicio, fecha_fin, ...rest }) {
  return {
    ...rest,
    fecha_inicio: new Date(fecha_inicio),
    fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
  };
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedUsers() {
  let count = 0;
  for (const user of [...demoUsers, demoFamilyUser]) {
    const { id, ...data } = user;
    await prisma.user.upsert({
      where:  { id },
      update: {}, // no sobreescribir si ya existe
      create: { id, ...data },
    });
    count++;
  }
  return count;
}

async function seedBusinesses() {
  let count = 0;
  for (const business of demoBusinesses) {
    const { id, ...data } = business;
    await prisma.business.upsert({
      where:  { id },
      update: { nif: data.nif }, // rellena nif en DBs ya existentes; no toca otros campos
      create: { id, ...data },
    });
    count++;
  }
  return count;
}

async function seedEvents() {
  let count = 0;
  for (const event of mockEvents) {
    const { id, ...raw } = event;
    const data = prepareEventForPrisma(raw);
    await prisma.event.upsert({
      where:  { id },
      update: data,
      create: { id, ...data },
    });
    count++;
  }
  return count;
}

/**
 * Resincroniza las secuencias SERIAL de users, businesses y events.
 *
 * Cuando se insertan IDs explícitos en columnas SERIAL, PostgreSQL no avanza
 * automáticamente la secuencia. Si luego se hace un insert sin ID explícito,
 * la secuencia puede generar un ID ya ocupado (conflicto de PK).
 *
 * Esta función actualiza cada secuencia al valor máximo de id actual,
 * de modo que el próximo insert automático obtendrá max(id) + 1.
 *
 * Usa `pg_get_serial_sequence` para no depender del nombre exacto de la secuencia.
 */
async function syncSequences() {
  const tables = ['users', 'businesses', 'events'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 0), true) FROM "${table}"`,
    );
  }
}

// ---------------------------------------------------------------------------
// Orquestador principal
// ---------------------------------------------------------------------------

async function main() {
  const users     = await seedUsers();
  console.log(`  ✔ users      : ${users} registros (upsert) — 5 business + 1 family (id 100)`);

  const businesses = await seedBusinesses();
  console.log(`  ✔ businesses : ${businesses} registros (upsert)`);

  const events    = await seedEvents();
  console.log(`  ✔ events     : ${events} registros (upsert)`);

  await syncSequences();
  console.log(`  ✔ secuencias SERIAL resincronizadas (users, businesses, events)`);

  console.log('\n✅ Seed completado. DB lista para /api/events.');
}

main()
  .catch((error) => {
    console.error('\n❌ Error en el seed:', error.message ?? error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
