import { PrismaClient } from "@prisma/client";
import { mockEvents } from "../src/seed/mockEvents.js";

const prisma = new PrismaClient();

async function seedUsers() {
  console.log("Sembrando usuarios...");
  // 5 usuarios de negocio
  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { id: i },
      update: {},
      create: {
        id: i,
        email: `negocio${i}@demo.eus`,
        password: `$2b$10$placeholdersignupandloginpassword`,
        role: "business",
      },
    });
  }

  // 1 usuario de familia (ID 100, usado por favoritos)
  await prisma.user.upsert({
    where: { id: 100 },
    update: {},
    create: {
      id: 100,
      email: "familia.agirre@example.com",
      password: "$2b$10$placeholdersignupandloginpassword",
      role: "family",
    },
  });
  console.log("Usuarios sembrados.");
}

async function seedBusinesses() {
  console.log("Sembrando negocios...");
  for (let i = 1; i <= 5; i++) {
    await prisma.business.upsert({
      where: { id: i },
      update: {},
      create: {
        id: i,
        user_id: i,
        name: `Negocio Demo ${i}`,
        address: `Calle de los Negocios ${i}`,
        phone_number: `94400000${i}`,
        plan: 2, // Suscripción Pro por defecto
        nif: `N-000000${i}-Z`,
      },
    });
  }
  console.log("Negocios sembrados.");
}

async function seedEvents() {
  console.log("Sembrando eventos...");
  for (const event of mockEvents) {
    const formattedEvent = {
      ...event,
      fecha_inicio: new Date(event.fecha_inicio),
      fecha_fin: event.fecha_fin ? new Date(event.fecha_fin) : null,
      edad_minima: event.edad_minima !== null ? Number(event.edad_minima) : null,
      multiplicador: event.multiplicador !== null ? Number(event.multiplicador) : 1.0,
    };

    await prisma.event.upsert({
      where: { id: event.id },
      update: formattedEvent,
      create: formattedEvent,
    });
  }
  console.log("Eventos sembrados.");
}

async function syncSequences() {
  console.log("Sincronizando secuencias SERIAL...");
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 0), true) FROM "users";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('businesses', 'id'), COALESCE(MAX(id), 0), true) FROM "businesses";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE(MAX(id), 0), true) FROM "events";`
  );
  console.log("Secuencias sincronizadas.");
}

async function main() {
  try {
    await seedUsers();
    await seedBusinesses();
    await seedEvents();
    await syncSequences();
    console.log("✅ Seed completado con éxito.");
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
