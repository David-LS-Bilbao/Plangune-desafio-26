import { mockEvents } from '../seed/mockEvents.js';

/**
 * Capa de acceso a datos de eventos (entidad central, tabla `events` de init.sql).
 *
 * MVP / PRIMERA INTEGRACIÓN: lee de datos mock en memoria con el shape real de la DB.
 * Cuando se conecte Prisma, esta capa pasará a consultar PostgreSQL manteniendo la
 * misma firma pública y el mismo shape de salida.
 */

/** Crea un error HTTP con status para el errorHandler central. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Igualdad de texto tolerante a mayúsculas/espacios (null-safe). */
function sameText(a, b) {
  if (a == null || b == null) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/**
 * Devuelve los eventos que cumplen los filtros indicados.
 * Todos los filtros son opcionales; sin filtros devuelve todos los eventos.
 *
 * @param {object} filters
 * @param {string} [filters.municipio]
 * @param {string} [filters.territorio]
 * @param {string} [filters.categoria]
 * @param {string} [filters.tipo_evento]
 * @param {boolean} [filters.es_lluvia]
 * @param {boolean} [filters.es_carrito]
 * @param {boolean} [filters.es_cambiador]
 * @param {number} [filters.edad]          - apto si `edad_minima <= edad`
 * @param {string} [filters.fecha_desde]   - ISO; `fecha_inicio >= fecha_desde`
 * @param {string} [filters.fecha_hasta]   - ISO; `fecha_inicio <= fecha_hasta`
 * @returns {Array} eventos filtrados
 */
export function getEvents(filters = {}) {
  return mockEvents.filter((ev) => {
    if (filters.municipio && !sameText(ev.municipio, filters.municipio)) return false;
    if (filters.territorio && !sameText(ev.territorio, filters.territorio)) return false;
    if (filters.categoria && !sameText(ev.categoria, filters.categoria)) return false;
    if (filters.tipo_evento && !sameText(ev.tipo_evento, filters.tipo_evento)) return false;

    if (filters.es_lluvia !== undefined && ev.es_lluvia !== filters.es_lluvia) return false;
    if (filters.es_carrito !== undefined && ev.es_carrito !== filters.es_carrito) return false;
    if (filters.es_cambiador !== undefined && ev.es_cambiador !== filters.es_cambiador) return false;

    // Edad: el evento es apto si su edad mínima no supera la edad del peque.
    if (filters.edad !== undefined) {
      const edadMinima = ev.edad_minima ?? 0;
      if (edadMinima > filters.edad) return false;
    }

    // Rango de fechas sobre fecha_inicio.
    if (filters.fecha_desde && new Date(ev.fecha_inicio) < new Date(filters.fecha_desde)) {
      return false;
    }
    if (filters.fecha_hasta && new Date(ev.fecha_inicio) > new Date(filters.fecha_hasta)) {
      return false;
    }

    return true;
  });
}

/**
 * Busca un evento por id.
 * @param {number} id
 * @throws 404 si no existe.
 */
export function getEventById(id) {
  const event = mockEvents.find((ev) => ev.id === id);
  if (!event) {
    throw httpError(404, `Evento no encontrado: ${id}`);
  }
  return event;
}

export default { getEvents, getEventById };
