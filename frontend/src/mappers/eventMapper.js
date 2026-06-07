/**
 * Mapper de eventos: convierte el shape backend (snake_case, tabla `events`)
 * al shape cómodo que ya consume la UI actual (PlanCard, PlanDetail).
 *
 * Mantiene los campos crudos importantes (booleans de accesibilidad, lat/lng, fechas)
 * y además deriva los campos que la UI mock usaba (location, ageRange, tags, image),
 * para no rediseñar los componentes existentes.
 */

// Imagen de respaldo cuando el evento no trae `imagen_url` (hoy el seed los deja null).
// SVG inline (data URI): no hace ninguna petición de red ni depende de hosts externos.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
      '<rect width="600" height="400" fill="#e5e7eb"/>' +
      '<text x="50%" y="50%" font-family="sans-serif" font-size="30" fill="#9ca3af" ' +
      'text-anchor="middle" dominant-baseline="middle">Plangune</text>' +
      "</svg>",
  );

/** edad_minima/edad_maxima → etiqueta legible para la UI. */
function toAgeRange(edadMinima, edadMaxima) {
  if (edadMinima == null && edadMaxima == null) return "Todas las edades";
  const min = edadMinima ?? 0;
  if (edadMaxima != null) return `${min}-${edadMaxima} años`;
  if (min === 0) return "Todas las edades";
  return `${min}+ años`;
}

/** Flags booleanos de accesibilidad → etiquetas legibles (compat con plan.tags). */
function toTags(event) {
  const tags = [];
  if (event.es_carrito) tags.push("Apto Carrito");
  if (event.es_cambiador) tags.push("Cambiador");
  if (event.es_interior) tags.push("Interior");
  if (event.es_silla_ruedas) tags.push("Silla de ruedas");
  if (event.es_mascotas) tags.push("Mascotas");
  return tags;
}

/** Ubicación legible para card/detalle. */
function toLocation(event) {
  const parts = [event.municipio, event.territorio].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return event.lugar || "Euskadi";
}

/**
 * Convierte un evento backend en un "plan" para la UI.
 * @param {object} event evento crudo (shape backend). Acepta también alias en español.
 * @returns {object|null} plan para la UI, o null si la entrada no es válida.
 */
export function eventToPlan(event) {
  if (!event || typeof event !== "object") return null;

  const title = event.title ?? event.titulo ?? "Plan familiar";
  const description = event.description ?? event.descripcion ?? "";
  const price = event.price ?? event.precio ?? "Consultar";
  const categoria = event.categoria ?? null;
  const edadMinima = event.edad_minima ?? null;
  // `edad_maxima` no existe hoy en el contrato; se deja preparado (null) por si se añade.
  const edadMaxima = event.edad_maxima ?? null;

  return {
    id: event.id,

    // Texto principal (alias ES e inglés para flexibilidad de la UI)
    title,
    titulo: title,
    description,
    descripcion: description,

    // Ubicación
    location: toLocation(event),
    municipio: event.municipio ?? null,
    territorio: event.territorio ?? null,
    lugar: event.lugar ?? null,
    address: event.address ?? null,
    latitud: event.lat ?? null,
    longitud: event.lng ?? null,

    // Fechas
    fecha: event.fecha_inicio ?? null,
    fechaFin: event.fecha_fin ?? null,

    // Precio y categoría
    price,
    precio: price,
    category: categoria ?? "Plan",
    categoria,
    tipoEvento: event.tipo_evento ?? null,

    // Edad
    edad_minima: edadMinima,
    edad_maxima: edadMaxima,
    ageRange: toAgeRange(edadMinima, edadMaxima),

    // Accesibilidad / servicios familiares (crudos + derivados)
    es_carrito: Boolean(event.es_carrito),
    es_cambiador: Boolean(event.es_cambiador),
    es_interior: Boolean(event.es_interior),
    es_silla_ruedas: Boolean(event.es_silla_ruedas),
    es_mascotas: Boolean(event.es_mascotas),
    tags: toTags(event),

    // Contacto
    telefono: event.telefono ?? null,
    website: event.website ?? null,

    // Imagen
    image: event.imagen_url || PLACEHOLDER_IMAGE,
    imagen_url: event.imagen_url ?? null,

    // Campos sin equivalente en el backend (la UI los oculta si faltan)
    rating: event.rating ?? null,
    isIdeal: false,
  };
}

/**
 * Convierte un array de eventos backend en planes para la UI.
 * @param {Array} events
 * @returns {Array}
 */
export function eventsToPlans(events) {
  return (Array.isArray(events) ? events : []).map(eventToPlan).filter(Boolean);
}

export default { eventToPlan, eventsToPlans, PLACEHOLDER_IMAGE };
