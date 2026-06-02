import { asyncHandler } from '../utils/asyncHandler.js';
import { getEvents, getEventById } from '../services/event.service.js';

/** Convierte 'true'/'false' (query string) a boolean, o undefined. */
function parseBool(value) {
  if (value === undefined) return undefined;
  return value === 'true' || value === true;
}

/**
 * GET /api/events
 * Lista eventos con filtros opcionales (municipio, territorio, categoria,
 * tipo_evento, es_lluvia, es_carrito, es_cambiador, edad, fecha_desde, fecha_hasta).
 */
export const listEvents = asyncHandler(async (req, res) => {
  const { municipio, territorio, categoria, tipo_evento, fecha_desde, fecha_hasta } = req.query;

  const filters = {
    municipio,
    territorio,
    categoria,
    tipo_evento,
    es_lluvia: parseBool(req.query.es_lluvia),
    es_carrito: parseBool(req.query.es_carrito),
    es_cambiador: parseBool(req.query.es_cambiador),
    edad: req.query.edad !== undefined ? Number(req.query.edad) : undefined,
    fecha_desde,
    fecha_hasta,
  };

  res.status(200).json(getEvents(filters));
});

/** GET /api/events/:id → detalle (404 si no existe). */
export const getEvent = asyncHandler(async (req, res) => {
  res.status(200).json(getEventById(Number(req.params.id)));
});

export default { listEvents, getEvent };
