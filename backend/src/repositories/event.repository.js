import prisma from '../config/prisma.js';

/**
 * Capa de acceso a datos de eventos. Encapsula todas las queries Prisma/PostgreSQL.
 * No contiene lógica de negocio; solo traduce filtros a WHERE y devuelve filas crudas.
 *
 * Los campos Decimal (lat, lng, edad_minima, multiplicador) y Date (fecha_inicio,
 * fecha_fin) llegan como objetos Prisma; la serialización final se hace en el service.
 */

/**
 * Construye el objeto `where` de Prisma a partir de los filtros del service.
 * Todos los filtros son opcionales.
 */
function buildWhere(filters) {
  const where = {};

  if (filters.municipio)   where.municipio   = { equals: filters.municipio,   mode: 'insensitive' };
  if (filters.territorio)  where.territorio  = { equals: filters.territorio,  mode: 'insensitive' };
  if (filters.categoria)   where.categoria   = { equals: filters.categoria,   mode: 'insensitive' };
  if (filters.tipo_evento) where.tipo_evento = { equals: filters.tipo_evento, mode: 'insensitive' };

  if (filters.es_interior   !== undefined) where.es_interior   = filters.es_interior;
  if (filters.es_carrito  !== undefined) where.es_carrito  = filters.es_carrito;
  if (filters.es_cambiador !== undefined) where.es_cambiador = filters.es_cambiador;
  if (filters.es_silla_ruedas !== undefined) where.es_silla_ruedas = filters.es_silla_ruedas;
  if (filters.es_mascotas !== undefined) where.es_mascotas = filters.es_mascotas;

  // edad_minima <= filtro.edad  → el evento es apto para esa edad
  if (filters.edad !== undefined) {
    where.edad_minima = { lte: filters.edad };
  }

  // Rango de fechas sobre fecha_inicio
  if (filters.fecha_desde || filters.fecha_hasta) {
    where.fecha_inicio = {};
    if (filters.fecha_desde) where.fecha_inicio.gte = new Date(filters.fecha_desde);
    if (filters.fecha_hasta) where.fecha_inicio.lte = new Date(filters.fecha_hasta);
  }

  return where;
}

/**
 * Devuelve los eventos que cumplen los filtros.
 *
 * Paginación OPT-IN: si se pasa `{ skip, take }` se aplica límite + orden estable
 * (para la API pública /api/events, que nunca debe devolver resultados ilimitados).
 * Sin paginación devuelve TODOS — uso interno (p. ej. el recomendador, que necesita
 * el conjunto completo para puntuar). Así no cambia el comportamiento de esos llamadores.
 *
 * @param {object} [filters={}]
 * @param {{ skip?: number, take?: number }} [pagination]
 * @returns {Promise<Array>}
 */
export async function findEvents(filters = {}, pagination) {
  const where = buildWhere(filters);

  if (!pagination || pagination.take === undefined) {
    return prisma.event.findMany({ where });
  }

  return prisma.event.findMany({
    where,
    orderBy: { id: 'asc' }, // orden estable: hace que skip/take sea determinista
    skip: pagination.skip ?? 0,
    take: pagination.take,
  });
}

/**
 * Busca un evento por id. Devuelve `null` si no existe.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findEventById(id) {
  return prisma.event.findUnique({ where: { id } });
}
