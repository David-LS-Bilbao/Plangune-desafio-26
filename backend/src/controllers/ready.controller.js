import prisma from '../config/prisma.js';

/**
 * GET /api/ready — readiness probe.
 *
 * Valida la disponibilidad REAL de PostgreSQL con `SELECT 1` vía Prisma. Pensado para
 * orquestadores/Nginx Proxy Manager: distingue "proceso vivo" (/api/health) de
 * "listo para servir tráfico" (DB accesible).
 *
 * No expone stacktrace ni detalles de conexión: solo un estado genérico.
 */
export async function getReady(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'not_ready', database: 'unavailable' });
  }
}

export default getReady;
