import { eventToPlan } from "./eventMapper";

/**
 * Mapper de recomendaciones (GET /api/recommendations) → tarjeta para la UI.
 *
 * Cada item del backend trae:
 *   - `event`    : clave principal nueva.
 *   - `activity` : alias legacy del mismo objeto. Se usa si no hay `event`.
 *   - `score`    : puntuación (número).
 *   - `reasons`  : razones explicables (array de strings, mostrables al usuario).
 *   - `source`   : "data-api" | "local-fallback" → metadato técnico, NO se muestra en crudo.
 *
 * ⚠️ DIVERGENCIA DE CONTRATO CONOCIDA (reportada, no resuelta aquí):
 * el `event` de `source: "data-api"` NO viene normalizado al shape de `events`. Usa
 * `nombre`/`descripcion`/`precio`/`direccion`/`es_lluvia`, booleanos como strings
 * ("True"/"False"), `edad_minima` como string y SIN `id`. Este mapper normaliza ambos
 * shapes para que la UI no se rompa. Sin `id` no hay detalle interno ni favorito posible
 * (esos planes de Data no son eventos de nuestra DB).
 */

/** Coerción robusta de booleanos: acepta boolean nativo o string "true"/"false"/"True"/"False". */
function coerceBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return Boolean(value);
}

/**
 * Normaliza un event de recomendación (shape `events` local O shape Data) a claves
 * canónicas, antes de pasarlo a `eventToPlan`. Es idempotente sobre el shape local.
 */
function normalizeRecommendationEvent(ev) {
  return {
    ...ev,
    id: ev.id ?? null,
    title: ev.title ?? ev.nombre ?? ev.titulo ?? null,
    description: ev.description ?? ev.descripcion ?? null,
    price: ev.price ?? ev.precio ?? null,
    address: ev.address ?? ev.direccion ?? null,
    municipio: ev.municipio ?? null,
    territorio: ev.territorio ?? null,
    lugar: ev.lugar ?? null,
    es_carrito: coerceBool(ev.es_carrito),
    es_cambiador: coerceBool(ev.es_cambiador),
    // El shape local usa `es_interior`; el de Data usa `es_lluvia` (mismo significado).
    es_interior: coerceBool(ev.es_interior ?? ev.es_lluvia),
    es_silla_ruedas: coerceBool(ev.es_silla_ruedas),
    es_mascotas: coerceBool(ev.es_mascotas),
    edad_minima: ev.edad_minima != null ? Number(ev.edad_minima) : null,
    imagen_url: ev.imagen_url ?? null,
    lat: ev.lat ?? null,
    lng: ev.lng ?? null,
    fecha_inicio: ev.fecha_inicio ?? null,
    fecha_fin: ev.fecha_fin ?? null,
    tipo_evento: ev.tipo_evento ?? null,
  };
}

/** Convierte la puntuación en una etiqueta amable (no se muestra el número crudo). */
export function toScoreLabel(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "Plan recomendado";
  if (score >= 85) return "Ideal para tu familia";
  if (score >= 65) return "Muy buen plan";
  return "Buen plan";
}

/**
 * Convierte un item de recomendación en una tarjeta de UI.
 * @param {object} rec
 * @returns {object|null}
 */
export function recommendationToCard(rec) {
  if (!rec || typeof rec !== "object") return null;

  // `event` es la clave nueva; `activity` el alias legacy (mismo objeto).
  const rawEvent = rec.event ?? rec.activity ?? null;
  if (!rawEvent || typeof rawEvent !== "object") return null;

  const plan = eventToPlan(normalizeRecommendationEvent(rawEvent));
  if (!plan) return null;

  const score = typeof rec.score === "number" ? rec.score : null;

  return {
    ...plan,
    // `id` puede ser null (recomendaciones de Data sin evento interno):
    // la UI oculta detalle/favorito en ese caso.
    hasDetail: plan.id != null,
    score,
    scoreLabel: toScoreLabel(score),
    reasons: Array.isArray(rec.reasons) ? rec.reasons : [],
    // metadato técnico para lógica interna/telemetría; no se renderiza en crudo.
    recSource: rec.source ?? null,
  };
}

/**
 * Convierte la lista de recomendaciones en tarjetas, descartando inválidas.
 * @param {Array} list
 * @returns {Array}
 */
export function recommendationsToCards(list) {
  return (Array.isArray(list) ? list : []).map(recommendationToCard).filter(Boolean);
}

export default { recommendationToCard, recommendationsToCards, toScoreLabel };
