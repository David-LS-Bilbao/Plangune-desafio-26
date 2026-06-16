/**
 * Serialización de eventos (tabla `events`) · helper común.
 *
 * Convierte los tipos que Prisma devuelve (Decimal, Date) a tipos JSON estables,
 * manteniendo el shape público idéntico. Seguro tanto para objetos Prisma reales
 * como para mocks: si los valores ya son nativos (number/string), la conversión es no-op.
 *
 * No contiene lógica de negocio, no toca la DB, no cambia ni elimina campos.
 *
 * Centraliza la lógica que antes estaba duplicada en event/recommendation/favorite services.
 */

/** Decimal de Prisma / number / string numérico → number; null|undefined → null. */
export function toNumberOrNull(value) {
  if (value == null) return null;
  return typeof value === 'number' ? value : Number(value.toString());
}

/** Date de Prisma → ISO string; string (ya ISO) → se mantiene; null|undefined → null. */
export function toIsoOrNull(value) {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : value;
}

/**
 * Normaliza un evento crudo (Prisma o mock) al shape público estable.
 * Mantiene todos los campos del evento; solo convierte los tipos de los campos
 * Decimal (lat, lng, edad_minima, multiplicador) y Date (fecha_inicio, fecha_fin).
 *
 * @param {object} event evento crudo
 * @returns {object} evento con tipos JSON estables
 */
export function serializeEvent(event) {
  return {
    ...event,
    lat:           toNumberOrNull(event.lat),
    lng:           toNumberOrNull(event.lng),
    edad_minima:   toNumberOrNull(event.edad_minima),
    multiplicador: toNumberOrNull(event.multiplicador),
    fecha_inicio:  toIsoOrNull(event.fecha_inicio),
    fecha_fin:     toIsoOrNull(event.fecha_fin),
  };
}

export default serializeEvent;
