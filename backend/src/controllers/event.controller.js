import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination } from '../utils/pagination.js';
import { getEvents, getEventById } from '../services/event.service.js';

/** Convierte 'true'/'false' (query string) a boolean, o undefined. */
function parseBool(value) {
  if (value === undefined) return undefined;
  return value === 'true' || value === true;
}

/**
 * GET /api/events
 * Lista eventos con filtros opcionales (municipio, territorio, categoria,
 * tipo_evento, es_interior, es_carrito, es_cambiador, es_silla_ruedas, es_mascotas,
 * edad, fecha_desde, fecha_hasta).
 */
export const listEvents = asyncHandler(async (req, res) => {
  const { municipio, territorio, categoria, tipo_evento, fecha_desde, fecha_hasta } = req.query;

  const filters = {
    municipio,
    territorio,
    categoria,
    tipo_evento,
    es_interior: parseBool(req.query.es_interior),
    es_carrito: parseBool(req.query.es_carrito),
    es_cambiador: parseBool(req.query.es_cambiador),
    es_silla_ruedas: parseBool(req.query.es_silla_ruedas),
    es_mascotas: parseBool(req.query.es_mascotas),
    edad: req.query.edad !== undefined ? Number(req.query.edad) : undefined,
    fecha_desde,
    fecha_hasta,
  };

  // Paginación segura (límite duro): la API pública nunca devuelve eventos ilimitados.
  const pagination = parsePagination(req.query);
  res.status(200).json(await getEvents(filters, pagination));
});

/** GET /api/events/:id → detalle (404 si no existe). */
export const getEvent = asyncHandler(async (req, res) => {
  res.status(200).json(await getEventById(Number(req.params.id)));
});

export default { listEvents, getEvent };
