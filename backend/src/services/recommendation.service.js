import { findEvents } from '../repositories/event.repository.js';
import { serializeEvent, toNumberOrNull } from '../utils/serializeEvent.js';
import { isDataRecommenderEnabled, fetchDataPlanes } from '../clients/dataRecommender.client.js';

/**
<<<<<<< Updated upstream
 * Recomendador de DESAFIO-26.
 *
 * Fuente PRINCIPAL: la API de Data (Flask) `GET /planes`, cuando `DATA_RECOMMENDER_ENABLED=true`.
 * Fuente FALLBACK: recomendador local reglado y explicable (Family Score) sobre los eventos
 * reales de Prisma/PostgreSQL. Se usa si Data está deshabilitado, falla, agota timeout o
 * devuelve algo inválido/vacío.
 *
 * El frontend SIEMPRE consume este Express; nunca llama a Flask directamente.
 * Cada item lleva `source: "data-api" | "local-fallback"`. `activity` es alias legacy de `event`.
 *
 * Family Score local (mapeo desde la API Activity previa):
 *   childrenAges     → edad_minima <= min(childrenAges)
 *   strollerFriendly → es_carrito
 *   rainSuitable     → es_interior
 *   municipality     → municipio (case-insensitive contains)
 *   budget           → price parseado ("Gratis"=0, "8 €"=8; no parseable = no suma ni penaliza)
 */

// Serialización de eventos: helper común en utils/serializeEvent.js.

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
=======
 * Recomendador local: Family Score atómico y simple.
 * Devuelve como máximo 3 eventos ordenados por score, cada uno con sus reasons.
 * Scoring determinista (sin IA) que se usa cuando Data está deshabilitado o falla.
 */
const DEFAULT_RECOMMENDATION_LIMIT = 3;

/** Parsea el campo `price` a un coste numérico en euros (best effort). */
function parsePrice(price) {
  if (!price) return 0;
  const normalized = price.trim().toLowerCase();
  if (normalized === 'gratis') return 0;
  const match = normalized.match(/(\d+(?:[.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

/** Calcula score y razones de un evento frente al contexto. */
>>>>>>> Stashed changes
function scoreEvent(event, context) {
  const { childrenAges = [], strollerFriendly, rainSuitable, budget, municipality } = context;

  let score = 50;
  const reasons = [];

<<<<<<< Updated upstream
  // Edad: apto si edad_minima <= el más pequeño de los peques
=======
>>>>>>> Stashed changes
  if (childrenAges.length > 0) {
    const minAge = Math.min(...childrenAges);
    const edadMinima = toNumberOrNull(event.edad_minima) ?? 0;
    if (edadMinima <= minAge) {
      score += 20;
<<<<<<< Updated upstream
      reasons.push(`Apto para la edad de tus peques (edad mínima: ${edadMinima} años)`);
=======
      reasons.push(`Apto para edades desde ${edadMinima} años`);
>>>>>>> Stashed changes
    }
  }

  if (strollerFriendly && event.es_carrito) {
    score += 10;
    reasons.push('Accesible con carrito');
  }

  if (rainSuitable && event.es_interior) {
    score += 10;
<<<<<<< Updated upstream
    reasons.push('Buen plan si llueve (a cubierto)');
  }

  if (municipality && event.municipio?.toLowerCase().includes(municipality.toLowerCase())) {
    score += 10;
    reasons.push(`Cerca de ${municipality}`);
=======
    reasons.push('Perfecto si llueve (a cubierto)');
>>>>>>> Stashed changes
  }

  if (typeof budget === 'number' && !Number.isNaN(budget)) {
    const cost = parsePrice(event.price);
<<<<<<< Updated upstream
    if (cost !== null && cost <= budget) {
      score += 10;
      const label = cost === 0 ? 'Gratis' : `${cost} €`;
      reasons.push(`Dentro de tu presupuesto (${label})`);
    }
  }

  return { score: Math.min(score, 100), reasons };
}

// ---------------------------------------------------------------------------
// Fallback local (recomendador reglado sobre events de Prisma)
// ---------------------------------------------------------------------------

/**
 * Recomendador local: hasta 3 eventos ordenados por Family Score.
 * Cada item lleva `source: "local-fallback"`. `activity` es alias legacy de `event`.
 *
 * @param {object}   [context={}]
 * @param {number[]} [context.childrenAges]
 * @param {boolean}  [context.strollerFriendly]
 * @param {boolean}  [context.rainSuitable]
 * @param {number}   [context.budget]
 * @param {string}   [context.municipality]
 * @returns {Promise<Array<{event, activity, score, reasons, source}>>}
 */
export async function getLocalRecommendations(context = {}) {
  const rawEvents = await findEvents({});

  const scored = rawEvents.map((rawEvent) => {
    const event = serializeEvent(rawEvent);
    const { score, reasons } = scoreEvent(event, context);
    return { event, activity: event, score, reasons, source: 'local-fallback' };
=======
    if (cost === 0 || cost <= budget) {
      score += 10;
      const label = cost === 0 ? 'Gratis' : `${cost}€`;
      reasons.push(`Dentro del presupuesto (${label})`);
    }
  }

  if (municipality && event.municipio?.toLowerCase().includes(municipality.toLowerCase())) {
    score += 10;
    reasons.push(`En ${municipality}`);
  }

  return { score: Math.min(score, 100), reasons };
}

function mapContextToDataParams(context) {
  const params = {};

  if (context.municipality) params.ubicacion = context.municipality;
  if (Array.isArray(context.childrenAges) && context.childrenAges.length > 0) {
    params.edad_max = Math.min(...context.childrenAges);
  }
  if (context.strollerFriendly !== undefined) params.carrito = context.strollerFriendly;
  if (context.rainSuitable !== undefined) params.lluvia = context.rainSuitable;
  if (context.changingTable !== undefined) params.cambiador = context.changingTable;
  if (context.wheelchairAccessible !== undefined) params.silla_ruedas = context.wheelchairAccessible;
  if (context.petsAllowed !== undefined) params.mascotas = context.petsAllowed;
  if (context.includeKulturklik !== undefined) params.kulturklik = context.includeKulturklik;
  params.limite = context.limit ?? DEFAULT_RECOMMENDATION_LIMIT;

  return params;
}

function getDataPlanesArray(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.resultados)) return response.resultados;
  return null;
}

function mapDataPlaneToRecommendation(plan) {
  return {
    event: plan,
    activity: plan,
    score: typeof plan.score === 'number' ? plan.score : 3,
    reasons: Array.isArray(plan.reasons) && plan.reasons.length > 0
      ? plan.reasons
      : ['Recomendado por el servicio Data'],
    source: 'data-api',
  };
}

async function getLocalRecommendations(context = {}) {
  const allEvents = await findEvents({});

  const scored = allEvents.map((rawEvent) => {
    const event = serializeEvent(rawEvent);
    const { score, reasons } = scoreEvent(event, context);
    return {
      event,
      activity: event,
      score,
      reasons,
      source: 'local-fallback',
    };
>>>>>>> Stashed changes
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, context.limit ?? DEFAULT_RECOMMENDATION_LIMIT);
<<<<<<< Updated upstream
}

// ---------------------------------------------------------------------------
// Integración con Data (recomendador principal)
// ---------------------------------------------------------------------------

/** Límite por defecto de recomendaciones (contrato público estable). */
const DEFAULT_RECOMMENDATION_LIMIT = 3;

/** Mapea el contexto de Express a los query params de la API de Data. */
function buildDataParams(context = {}) {
  const params = {};
  if (context.municipality) params.ubicacion = context.municipality;
  if (Array.isArray(context.childrenAges) && context.childrenAges.length > 0) {
    params.edad_max = Math.min(...context.childrenAges);
  }
  if (context.rainSuitable !== undefined) params.lluvia = context.rainSuitable;
  if (context.strollerFriendly !== undefined) params.carrito = context.strollerFriendly;
  if (context.changingTable !== undefined) params.cambiador = context.changingTable;
  if (context.wheelchairAccessible !== undefined) params.silla_ruedas = context.wheelchairAccessible;
  if (context.petsAllowed !== undefined) params.mascotas = context.petsAllowed;
  if (context.includeKulturklik !== undefined) params.kulturklik = context.includeKulturklik;
  // Siempre se envía un límite a Data (el del usuario o el por defecto del contrato).
  params.limite = context.limit ?? DEFAULT_RECOMMENDATION_LIMIT;
  return params;
}

/**
 * Normaliza la respuesta de Data a un array de "planes".
 * Formato principal de Data: `{ total, filtros, resultados }`.
 * Acepta también, de forma defensiva, un array directo.
 * Devuelve `null` si el shape no es reconocible (→ fallback local).
 */
function extractDataPlanes(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.resultados)) return response.resultados;
  return null;
}

/** Mapea cada "plan" de Data a un item de recomendación con shape compatible. */
function mapDataPlanesToItems(planes) {
  return planes.map((plan) => ({
    event: plan,
    activity: plan, // alias legacy de event
    score: typeof plan.score === 'number' ? plan.score : 3,
    reasons:
      Array.isArray(plan.reasons) && plan.reasons.length > 0
        ? plan.reasons
        : ['Recomendado por el servicio Data'],
    source: 'data-api',
  }));
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Devuelve hasta 3 recomendaciones.
 * - Si Data está habilitado y responde con resultados válidos → `source: "data-api"`.
 * - En cualquier otro caso (deshabilitado, error, timeout, 503, vacío o inválido)
 *   → recomendador local con `source: "local-fallback"`.
 *
 * @param {object} [context={}]
 * @returns {Promise<Array<{event, activity, score, reasons, source}>>}
 */
export async function getRecommendations(context = {}) {
  if (isDataRecommenderEnabled()) {
    try {
      const response = await fetchDataPlanes(buildDataParams(context));
      const planes = extractDataPlanes(response);
      if (Array.isArray(planes) && planes.length > 0) {
        const limit = context.limit ?? DEFAULT_RECOMMENDATION_LIMIT;
        // Contrato estable: Express limita por seguridad aunque Data devuelva más.
        return mapDataPlanesToItems(planes).slice(0, limit);
      }
      // Respuesta inválida, vacía o sin resultados → se cae al fallback local.
    } catch {
      // Error de red, timeout (AbortError) o status no-2xx → fallback local.
    }
  }

  return getLocalRecommendations(context);
=======
>>>>>>> Stashed changes
}

/**
 * Devuelve recomendaciones de Data si está habilitado, o el fallback local si falla.
 */
export async function getRecommendations(context = {}) {
  if (isDataRecommenderEnabled()) {
    try {
      const params = mapContextToDataParams(context);
      const response = await fetchDataPlanes(params);
      const planes = getDataPlanesArray(response);

      if (Array.isArray(planes) && planes.length > 0) {
        return planes
          .map(mapDataPlaneToRecommendation)
          .slice(0, context.limit ?? DEFAULT_RECOMMENDATION_LIMIT);
      }
    } catch {
      // Data API falló o timeout: usamos fallback local.
    }

    return getLocalRecommendations(context);
  }

  return getLocalRecommendations(context);
}

export default { getRecommendations };

