import prisma from '../config/prisma.js';
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

/** POST /api/events → crea un evento (requiere role business). */
export const createEvent = asyncHandler(async (req, res) => {
  if (req.user.role !== 'business') {
    return res.status(403).json({ message: 'Solo negocios pueden crear eventos' });
  }
  const business = await prisma.business.findUnique({ where: { user_id: req.user.id } });
  if (!business) {
    return res.status(404).json({ message: 'Perfil de negocio no encontrado' });
  }

  const { title, description, category, address, date, price, imagen_url } = req.body;
  const event = await prisma.event.create({
    data: {
      business_id: business.id,
      title,
      description,
      categoria: category,
      address,
      fecha_inicio: date ? new Date(date) : new Date(),
      price: price ? String(price) : null,
      imagen_url
    }
  });
  res.status(201).json({ event });
});

/** GET /api/business/events → lista los eventos del negocio logueado. */
export const getBusinessEvents = asyncHandler(async (req, res) => {
  if (req.user.role !== 'business') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  const business = await prisma.business.findUnique({ where: { user_id: req.user.id } });
  if (!business) {
    return res.status(200).json([]);
  }

  const events = await prisma.event.findMany({ where: { business_id: business.id } });
  res.status(200).json(events);
});

export default { listEvents, getEvent, createEvent, getBusinessEvents };
