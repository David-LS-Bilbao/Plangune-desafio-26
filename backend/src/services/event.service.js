import { findEvents, findEventById } from '../repositories/event.repository.js';

/**
 * Capa de negocio de eventos.
 *
 * Delega el acceso a datos en event.repository.js (Prisma/PostgreSQL).
 * Responsabilidades:
 *  - Llamar al repository con los filtros parseados.
 *  - Serializar campos Prisma (Decimal → number, Date → ISO string) para mantener
 *    el shape público estable independientemente del origen de datos.
 *  - Lanzar 404 cuando el evento no existe.
 *
 * El contrato público (nombres de campos, tipos JSON) es idéntico al runtime mock previo.
 */

/** Crea un error HTTP con status para el errorHandler central. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Convierte un valor a number de forma segura.
 * Acepta número nativo, Prisma Decimal o string numérico.
 */
function toNum(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  return Number(v.toString());
}

/**
 * Convierte un valor a ISO string de forma segura.
 * Acepta Date de Prisma o string ISO del mock.
 */
function toISO(v) {
  if (v == null) return null;
  return v instanceof Date ? v.toISOString() : v;
}

/**
 * Normaliza un evento crudo de Prisma al shape público estable.
 * Seguro tanto para objetos Prisma reales (Decimal/Date) como para
 * plain-objects del mock (tipos ya nativos → operación no destructiva).
 */
function serializeEvent(ev) {
  return {
    ...ev,
    lat:           toNum(ev.lat),
    lng:           toNum(ev.lng),
    edad_minima:   toNum(ev.edad_minima),
    multiplicador: toNum(ev.multiplicador),
    fecha_inicio:  toISO(ev.fecha_inicio),
    fecha_fin:     toISO(ev.fecha_fin),
  };
}

/**
 * Devuelve los eventos que cumplen los filtros indicados.
 * Todos los filtros son opcionales; sin filtros devuelve todos los eventos.
 *
 * @param {object} [filters={}]
 * @param {string}  [filters.municipio]
 * @param {string}  [filters.territorio]
 * @param {string}  [filters.categoria]
 * @param {string}  [filters.tipo_evento]
 * @param {boolean} [filters.es_lluvia]
 * @param {boolean} [filters.es_carrito]
 * @param {boolean} [filters.es_cambiador]
 * @param {number}  [filters.edad]          apto si edad_minima <= edad
 * @param {string}  [filters.fecha_desde]   ISO; fecha_inicio >= fecha_desde
 * @param {string}  [filters.fecha_hasta]   ISO; fecha_inicio <= fecha_hasta
 * @returns {Promise<Array>}
 */
export async function getEvents(filters = {}) {
  const events = await findEvents(filters);
  return events.map(serializeEvent);
}

/**
 * Busca un evento por id.
 * @param {number} id
 * @throws {Error} 404 si no existe.
 * @returns {Promise<object>}
 */
export async function getEventById(id) {
  const event = await findEventById(id);
  if (!event) {
    throw httpError(404, `Evento no encontrado: ${id}`);
  }
  return serializeEvent(event);
}

export default { getEvents, getEventById };
