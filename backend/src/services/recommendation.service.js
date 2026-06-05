import { isDataRecommenderEnabled, fetchDataPlanes } from '../clients/dataRecommender.client.js';
import { findEvents } from '../repositories/event.repository.js';

/** ¿La actividad cubre las edades indicadas? */
function coversAges(event, ages) {
  return ages.every((age) => age >= (event.edad_minima ?? 0));
}

/** Parsea cadenas de precio como "Gratis", "Desde 12€", "8 €", etc. */
function parsePrice(price) {
  if (price === null || price === undefined) return null;
  const str = String(price).trim();
  if (/gratis/i.test(str)) {
    return { value: 0, label: 'Gratis' };
  }
  const match = str.match(/(\d+)/);
  if (match) {
    const val = Number(match[1]);
    return { value: val, label: `${val}€` };
  }
  return null;
}

/**
 * Recomendador reglado y explicable (Family Score, MVP).
 * Devuelve como máximo 3 planes (o limit) ordenados por score.
 * Primero intenta consultar el recomendador principal de Data (Flask/API) si está habilitado.
 * Si falla, no está disponible o no da resultados, utiliza el recomendador local.
 *
 * @param {object} context
 * @param {number[]} [context.childrenAges]
 * @param {boolean} [context.strollerFriendly]
 * @param {boolean} [context.rainSuitable]
 * @param {number}  [context.budget]
 * @param {string}  [context.municipality]
 * @param {boolean} [context.changingTable]
 * @param {boolean} [context.wheelchairAccessible]
 * @param {boolean} [context.petsAllowed]
 * @param {boolean} [context.includeKulturklik]
 * @param {number}  [context.limit]
 */
export async function getRecommendations(context = {}) {
  const {
    childrenAges = [],
    strollerFriendly,
    rainSuitable,
    budget,
    municipality,
    changingTable,
    wheelchairAccessible,
    petsAllowed,
    includeKulturklik,
  } = context;

  const limit = context.limit !== undefined ? Number(context.limit) : 3;

  if (isDataRecommenderEnabled()) {
    try {
      const params = {
        ubicacion: municipality,
        carrito: strollerFriendly,
        lluvia: rainSuitable,
        limite: limit,
      };

      if (childrenAges.length > 0) {
        params.edad_max = Math.min(...childrenAges);
      }

      if (changingTable !== undefined) params.cambiador = changingTable;
      if (wheelchairAccessible !== undefined) params.silla_ruedas = wheelchairAccessible;
      if (petsAllowed !== undefined) params.mascotas = petsAllowed;
      if (includeKulturklik !== undefined) params.kulturklik = includeKulturklik;

      const dataResponse = await fetchDataPlanes(params);

      let planes = [];
      if (Array.isArray(dataResponse)) {
        planes = dataResponse;
      } else if (dataResponse && Array.isArray(dataResponse.resultados)) {
        planes = dataResponse.resultados;
      }

      if (planes.length > 0) {
        return planes.slice(0, limit).map((plan) => ({
          event: plan,
          activity: plan, // alias legacy mantenido
          score: plan.score ?? 50,
          reasons: plan.reasons ?? [],
          source: 'data-api',
        }));
      }
    } catch (error) {
      // Ignorar errores para hacer fallback local
    }
  }

  // Fallback local
  const events = await findEvents({});
  const scored = events.map((event) => {
    let score = 50;
    const reasons = [];

    if (childrenAges.length > 0 && coversAges(event, childrenAges)) {
      score += 20;
      reasons.push(
        `Apto para la edad de tus peques (mínimo ${event.edad_minima} años)`,
      );
    }

    if (strollerFriendly && event.es_carrito) {
      score += 10;
      reasons.push('Accesible con carrito');
    }

    if (rainSuitable && event.es_interior) {
      score += 10;
      reasons.push('Buen plan si llueve (a cubierto)');
    }

    if (typeof budget === 'number' && !Number.isNaN(budget)) {
      const parsed = parsePrice(event.price);
      if (parsed !== null && parsed.value <= budget) {
        score += 10;
        reasons.push(`Dentro del presupuesto (${parsed.label})`);
      }
    }

    if (
      municipality &&
      event.municipio &&
      event.municipio.toLowerCase().includes(municipality.toLowerCase())
    ) {
      score += 10;
      reasons.push(`Cerca de ${municipality}`);
    }

    // Pequeño empujón por valoración media (hasta +10).
    score += Math.round((event.averageRating || event.rating || 0) * 2);

    return {
      event,
      activity: event, // alias legacy
      score: Math.min(score, 100),
      reasons,
      source: 'local-fallback',
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
