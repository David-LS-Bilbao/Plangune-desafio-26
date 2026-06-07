import prisma from '../config/prisma.js';

/**
 * Capa de acceso a datos de usuarios (tabla `users`). Encapsula las queries Prisma.
 * No contiene lógica de negocio (hashing, validación, tokens): eso vive en auth.service.
 */

/**
 * Busca un usuario por email (único). Devuelve la fila cruda (incluye `password`) o null.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Busca un usuario por id. Devuelve la fila cruda (incluye `password`) o null.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Crea un usuario. `password` debe llegar ya hasheado (responsabilidad del service).
 * @param {{ email: string, password: string, role: string }} data
 * @returns {Promise<object>} usuario creado (incluye `password`)
 */
export async function createUser({ email, password, role }) {
  return prisma.user.create({ data: { email, password, role } });
}

export default { findUserByEmail, findUserById, createUser };
