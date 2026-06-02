import { findEvents } from '../repositories/event.repository.js';

/**
 * Recomendador reglado, determinista y explicable — Family Score.
 *
 * Fuente de datos: todos los eventos de Prisma/PostgreSQL (tabla `events`).
 * Scoring sobre campos reales de `events`; mapeo desde la API Activity previa:
 *   childrenAges   → edad_minima <= min(childrenAges)
 *   strollerFriendly → es_carrito
 *   rainSuitable   → es_lluvia
 *   municipality   → municipio (case-insensitive contains)
 *   budget         → price parseado ("Gratis"=0, "8 €"=8; no parseable = no suma ni penaliza)
 *
 * Campos deliberadamente no usados:
 *   - averageRating: no existe en `events`.
 *   - multiplicador: existe pero sin decisión documentada para scoring.
 *
 * Respuesta: { event, activity, score, reasons }
 *   `activity` es alias temporal de `event` para compatibilidad con frontend/tests actuales.
 *   Retirar cuando el frontend confirme migración a la clave `event`.
 */

// ---------------------------------------------------------------------------
// Helpers de serialización (mismo patrón que event.service.js)
// ---------------------------------------------------------------------------

function toNum(v) {
  if (v == null) return null;
  return typeof v === 'number' ? v : Number(v.toString());
}

function toISO(v) {
  if (v == null) return null;
  return v instanceof Date ? v.toISOString() : v;
}

/** Normaliza un objeto evento crudo (Prisma o mock) al shape público estable. */
function serializeEvent(ev) {
  return {
    ...ev,
    lat:           toNum(ev.lat),
    lng:           toNum(ev.lng),
    edad_minima:   toNum(ev.edad_minima),
    multiplicador: toNum(ev.multiplicador),
    fecha_inicio:  toISO(ev.fecha_inicio),
    fecha_fin:     toISO(ev.fecha_fin),
  };
}

// ---------------------------------------------------------------------------
// Helper de presupuesto
// ---------------------------------------------------------------------------

/**
 * Parsea el campo `price` (string libre) a un coste en euros.
 * - "Gratis"     → 0
 * - "8 €", "12€" → 8, 12   (primer número del string)
 * - cualquier otro valor → null (no suma ni penaliza)
 */
function parsePrice(price) {
  if (!price) return null;
  const normalized = price.trim().toLowerCase();
  if (normalized === 'gratis') return 0;
  const match = normalized.match(/^(\d+(?:[.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Calcula el score y las razones de un evento serializado frente al contexto.
 * @returns {{ score: number, reasons: string[] }}
 */
function scoreEvent(event, context) {
  const { childrenAges = [], strollerFriendly, rainSuitable, budget, municipality } = context;

  let score = 50;
  const reasons = [];

  // Edad: apto si edad_minima <= el más pequeño de los peques
  if (childrenAges.length > 0) {
    const minAge = Math.min(...childrenAges);
    const edadMinima = toNum(event.edad_minima) ?? 0;
    if (edadMinima <= minAge) {
      score += 20;
      reasons.push(`Apto para la edad de tus peques (edad mínima: ${edadMinima} años)`);
    }
  }

  if (strollerFriendly && event.es_carrito) {
    score += 10;
    reasons.push('Accesible con carrito');
  }

  if (rainSuitable && event.es_lluvia) {
    score += 10;
    reasons.push('Buen plan si llueve (a cubierto)');
  }

  if (municipality && event.municipio?.toLowerCase().includes(municipality.toLowerCase())) {
    score += 10;
    reasons.push(`Cerca de ${municipality}`);
  }

  if (typeof budget === 'number' && !Number.isNaN(budget)) {
    const cost = parsePrice(event.price);
    if (cost !== null && cost <= budget) {
      score += 10;
      const label = cost === 0 ? 'Gratis' : `${cost} €`;
      reasons.push(`Dentro de tu presupuesto (${label})`);
    }
  }

  return { score: Math.min(score, 100), reasons };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Devuelve hasta 3 eventos ordenados por Family Score.
 *
 * @param {object}   [context={}]
 * @param {number[]} [context.childrenAges]
 * @param {boolean}  [context.strollerFriendly]
 * @param {boolean}  [context.rainSuitable]
 * @param {number}   [context.budget]
 * @param {string}   [context.municipality]
 * @returns {Promise<Array<{event, activity, score, reasons}>>}
 */
export async function getRecommendations(context = {}) {
  const rawEvents = await findEvents({});

  const scored = rawEvents.map((rawEvent) => {
    const event = serializeEvent(rawEvent);
    const { score, reasons } = scoreEvent(event, context);
    // `activity` es alias temporal para no romper frontend/tests hasta migración.
    return { event, activity: event, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}
