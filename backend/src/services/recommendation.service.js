import { findEvents } from '../repositories/event.repository.js';
import { serializeEvent, toNumberOrNull } from '../utils/serializeEvent.js';
import { isDataRecommenderEnabled, fetchDataPlanes } from '../clients/dataRecommender.client.js';
import { normalizeDataPlaneToEvent } from '../utils/normalizeDataEvent.js';

/**
 * Recomendador local: Family Score atómico y simple.
 * Devuelve como máximo 3 eventos ordenados por score, cada uno con sus reasons.
 * Scoring determinista (sin IA) que se usa cuando Data está deshabilitado o falla.
 */
const DEFAULT_RECOMMENDATION_LIMIT = 3;

/**
 * Parsea el campo `price` a un coste numérico en euros (best effort).
 * Devuelve `0` para "Gratis", el número detectado para strings con cifra, y
 * `null` cuando el precio es desconocido o no parseable (null/undefined/vacío/
 * texto sin número). Un precio desconocido NO debe tratarse como gratis.
 */
function parsePrice(price) {
  if (price === null || price === undefined) return null;
  const normalized = String(price).trim().toLowerCase();
  if (normalized === '') return null;
  if (normalized === 'gratis') return 0;
  const match = normalized.match(/(\d+(?:[.,]\d+)?)/);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

/** Calcula score y razones de un evento frente al contexto. */
function scoreEvent(event, context) {
  const { childrenAges = [], strollerFriendly, rainSuitable, budget, municipality } = context;

  let score = 50;
  const reasons = [];

  if (childrenAges.length > 0) {
    const minAge = Math.min(...childrenAges);
    const edadMinima = toNumberOrNull(event.edad_minima) ?? 0;
    if (edadMinima <= minAge) {
      score += 20;
      reasons.push(`Apto para edades desde ${edadMinima} años`);
    }
  }

  if (strollerFriendly && event.es_carrito) {
    score += 10;
    reasons.push('Accesible con carrito');
  }

  if (rainSuitable && event.es_interior) {
    score += 10;
    reasons.push('Perfecto si llueve (a cubierto)');
  }

  if (typeof budget === 'number' && !Number.isNaN(budget)) {
    const cost = parsePrice(event.price);
    // Sin bonus si el precio es desconocido (cost === null): no se asume gratis.
    if (cost !== null && cost <= budget) {
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
  // Normaliza el plan crudo de Data al shape público de `events` (contrato F↔B).
  // `event` y `activity` (alias legacy) apuntan al MISMO objeto normalizado.
  const event = normalizeDataPlaneToEvent(plan);
  return {
    event,
    activity: event,
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
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, context.limit ?? DEFAULT_RECOMMENDATION_LIMIT);
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
