import { PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma (PostgreSQL) preparado para uso futuro.
 *
 * En el bootstrap aún NO hay modelos ni features. Prisma se conecta de forma
 * perezosa (en la primera consulta), por lo que importar este módulo no abre
 * conexión ni requiere DATABASE_URL para que el healthcheck funcione.
 *
 * Requiere haber ejecutado antes `npm run prisma:generate --workspace backend`.
 */
export const prisma = new PrismaClient();

export default prisma;
