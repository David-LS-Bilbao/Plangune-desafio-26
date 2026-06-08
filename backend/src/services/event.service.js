import { findEvents, findEventById } from '../repositories/event.repository.js';
import { serializeEvent } from '../utils/serializeEvent.js';

/**
 * Capa de negocio de eventos.
 *
 * Delega el acceso a datos en event.repository.js (Prisma/PostgreSQL).
 * Responsabilidades:
 *  - Llamar al repository con los filtros parseados.
 *  - Serializar campos Prisma (Decimal → number, Date → ISO string) vía el helper común
 *    `serializeEvent`, para mantener el shape público estable.
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
 * Devuelve los eventos que cumplen los filtros indicados.
 * Todos los filtros son opcionales; sin filtros devuelve todos los eventos.
 *
 * @param {object} [filters={}]
 * @param {string}  [filters.municipio]
 * @param {string}  [filters.territorio]
 * @param {string}  [filters.categoria]
 * @param {string}  [filters.tipo_evento]
 * @param {boolean} [filters.es_interior]
 * @param {boolean} [filters.es_carrito]
 * @param {boolean} [filters.es_cambiador]
 * @param {boolean} [filters.es_silla_ruedas]
 * @param {boolean} [filters.es_mascotas]
 * @param {number}  [filters.edad]          apto si edad_minima <= edad
 * @param {string}  [filters.fecha_desde]   ISO; fecha_inicio >= fecha_desde
 * @param {string}  [filters.fecha_hasta]   ISO; fecha_inicio <= fecha_hasta
 * @param {{ skip?: number, take?: number }} [pagination] límite/offset para la API pública
 * @returns {Promise<Array>}
 */
export async function getEvents(filters = {}, pagination) {
  const events = await findEvents(filters, pagination);
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
