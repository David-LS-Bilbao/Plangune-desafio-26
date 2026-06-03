/**
 * Cliente HTTP del recomendador de Data (API Flask).
 *
 * Encapsula la llamada a `GET {DATA_API_URL}/planes`. Usa `fetch` nativo de Node
 * (no axios) y `AbortController` para aplicar timeout. No contiene lógica de negocio:
 * el service decide cuándo usar Data y cómo mapear/hacer fallback.
 *
 * Variables de entorno (leídas en cada llamada para que sean configurables/testeables):
 *   - DATA_RECOMMENDER_ENABLED  ("true" activa Data como recomendador principal)
 *   - DATA_API_URL              (por defecto http://localhost:5000)
 *   - DATA_API_TIMEOUT_MS       (por defecto 2000)
 */

const DEFAULT_DATA_API_URL = 'http://localhost:5000';
const DEFAULT_TIMEOUT_MS = 2000;

/** ¿Está habilitado el recomendador de Data como fuente principal? */
export function isDataRecommenderEnabled() {
  return process.env.DATA_RECOMMENDER_ENABLED === 'true';
}

/**
 * Llama a `GET {DATA_API_URL}/planes` con los `params` indicados (query string).
 * Lanza un error si la respuesta no es 2xx o si se supera el timeout.
 *
 * @param {Record<string, string|number|boolean>} [params={}]
 * @returns {Promise<unknown>} JSON parseado de la respuesta de Data
 */
export async function fetchDataPlanes(params = {}) {
  const baseUrl = process.env.DATA_API_URL || DEFAULT_DATA_API_URL;
  const timeoutMs = Number(process.env.DATA_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const url = new URL('/planes', baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const error = new Error(`Data API respondió ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export default { isDataRecommenderEnabled, fetchDataPlanes };
