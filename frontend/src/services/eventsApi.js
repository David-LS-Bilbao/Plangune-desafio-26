import apiClient from "./apiClient";

/**
 * Servicio de eventos/planes. Solo habla con Express:
 *   GET /api/events        (lista con filtros opcionales)
 *   GET /api/events/:id     (detalle)
 *
 * Los filtros usan los nombres snake_case del contrato
 * (municipio, territorio, es_interior, es_carrito, es_cambiador,
 *  es_silla_ruedas, es_mascotas, edad, fecha_desde, fecha_hasta...).
 */

/** Quita claves vacías/indefinidas para no enviar query params inútiles. */
function cleanParams(filters = {}) {
  const params = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params[key] = value;
    }
  }
  return params;
}

/**
 * Lista eventos aplicando filtros opcionales.
 * @param {object} [filters] filtros snake_case del contrato
 * @returns {Promise<Array>} array de eventos crudos (shape backend)
 */
export async function fetchEvents(filters = {}) {
  const { data } = await apiClient.get("/events", { params: cleanParams(filters) });
  return Array.isArray(data) ? data : [];
}

/**
 * Detalle de un evento por id.
 * @param {number|string} id
 * @returns {Promise<object>} evento crudo (shape backend); lanza si 404/err.
 */
export async function fetchEventById(id) {
  const { data } = await apiClient.get(`/events/${id}`);
  return data;
}

export default { fetchEvents, fetchEventById };
