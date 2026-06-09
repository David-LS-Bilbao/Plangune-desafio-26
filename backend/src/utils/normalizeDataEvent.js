/**
 * Normalizador de "planes" de la API de Data (Flask) al shape público de `events`.
 *
 * La API de Data devuelve los planes con un shape distinto al contrato F↔B:
 *   - `nombre`/`descripcion`/`direccion`/`precio` en vez de `title`/`description`/`address`/`price`.
 *   - `es_lluvia` en vez de `es_interior`.
 *   - booleanos como strings ("True"/"False").
 *   - `edad_minima` como string.
 *   - sin `id` interno (son lugares externos, no eventos de nuestra DB todavía).
 *
 * Este normalizador es PURO (sin DB, sin efectos) y deja el objeto con el shape de `events`
 * que espera el frontend (ver docs/contracts/frontend-backend-api-contract.md). Cuando el plan
 * de Data no corresponde a un evento interno, `id` queda en `null` (documentado en el contrato).
 */

/**
 * Coerción segura de booleanos.
 * Acepta booleanos nativos y strings "true"/"false"/"True"/"False" (con espacios).
 * Evita el bug clásico `Boolean("False") === true` (string no vacía es truthy).
 * @param {*} value
 * @returns {boolean}
 */
export function coerceBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  return Boolean(value);
}

/**
 * Base pública para resolver imágenes de eventos de Euskadi servidas como ruta relativa.
 * El recomendador de Data devuelve `imagen_url` como `/contenidos/evento/.../x.jpg`, que en
 * el navegador se resolvería contra el origen del frontend (404). Se sirven bien desde aquí.
 */
const EUSKADI_IMAGE_BASE = 'https://www.euskadi.eus';

/**
 * Devuelve una URL de imagen ABSOLUTA usable por el frontend.
 * - Rutas relativas que empiezan por `/` → se prefijan con `EUSKADI_IMAGE_BASE`.
 * - URLs absolutas (`http(s)://`) y protocol-relative (`//`) → se respetan tal cual.
 * - Vacío/null/undefined o tipo no string → `null` (el frontend usa el placeholder por categoría).
 * @param {*} value
 * @returns {string|null}
 */
export function toAbsoluteImageUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const url = value.trim();
  if (/^(https?:)?\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${EUSKADI_IMAGE_BASE}${url}`;
  return url;
}

/** number | string numérico → number; null/undefined/''/NaN → null. */
function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(n) ? null : n;
}

/**
 * Convierte un plan crudo de Data en un objeto con el shape público de `events`.
 * Construcción EXPLÍCITA: no arrastra claves crudas de Data (`nombre`, `precio`, `es_lluvia`...).
 *
 * @param {object} plan plan crudo devuelto por la API de Data
 * @returns {object} evento con shape de `events` (snake_case)
 */
export function normalizeDataPlaneToEvent(plan = {}) {
  const p = plan && typeof plan === 'object' ? plan : {};

  return {
    // `id` null cuando Data no expone un id interno (plan externo aún no presente en `events`).
    id: p.id ?? null,
    business_id: p.business_id ?? null,
    fuente: 'data-api',
    external_id: p.external_id ?? null,

    title: p.title ?? p.nombre ?? null,
    description: p.description ?? p.descripcion ?? null,
    categoria: p.categoria ?? null,
    tipo_plantilla: p.tipo_plantilla ?? null,

    municipio: p.municipio ?? null,
    territorio: p.territorio ?? null,
    address: p.address ?? p.direccion ?? null,
    lat: toNumberOrNull(p.lat),
    lng: toNumberOrNull(p.lng),

    telefono: p.telefono ?? null,
    email: p.email ?? null,
    website: p.website ?? null,

    // El shape local usa `es_interior`; el de Data usa `es_lluvia` (mismo significado).
    es_interior: coerceBool(p.es_interior ?? p.es_lluvia),
    es_carrito: coerceBool(p.es_carrito),
    es_cambiador: coerceBool(p.es_cambiador),
    es_silla_ruedas: coerceBool(p.es_silla_ruedas),
    es_mascotas: coerceBool(p.es_mascotas),

    edad_minima: toNumberOrNull(p.edad_minima),
    multiplicador: toNumberOrNull(p.multiplicador),

    fecha_inicio: p.fecha_inicio ?? null,
    fecha_fin: p.fecha_fin ?? null,
    lugar: p.lugar ?? null,
    price: p.price ?? p.precio ?? null,
    imagen_url: toAbsoluteImageUrl(p.imagen_url),
    tipo_evento: p.tipo_evento ?? null,
  };
}

export default { normalizeDataPlaneToEvent, coerceBool, toAbsoluteImageUrl };
