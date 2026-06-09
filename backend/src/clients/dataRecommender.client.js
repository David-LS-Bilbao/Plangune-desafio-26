/**
 * Cliente HTTP del recomendador de Data (API Flask).
 *
 * Encapsula la llamada a `POST {DATA_API_URL}/recomendar`. Usa `fetch` nativo de
 * Node (no axios) y `AbortController` para aplicar timeout. No contiene lógica de
 * negocio: el service decide cuándo usar Data, cómo construir la consulta/filtros
 * y cómo mapear/hacer fallback.
 *
 * Contrato real de Data (repo Desafio-Data · models/Recommender):
 *   POST /recomendar
 *   {
 *     "id_user": 0,                 // entero; 0 = sesión anónima (sin historial)
 *     "consulta": "Bilbao planes …",// texto libre; Data extrae el municipio del texto
 *     "filtros": { "carrito": true, "interior": false, ... }  // booleanos
 *   }
 *   → { user_id, municipio, fallback, n_candidatos, resultados: [ {id,title,…,score} ] }
 *
 * Variables de entorno (leídas en cada llamada para que sean configurables/testeables):
 *   - DATA_RECOMMENDER_ENABLED  ("true" activa Data como recomendador principal)
 *   - DATA_API_URL              (por defecto http://localhost:5000)
 *   - DATA_API_TIMEOUT_MS       (por defecto 4000)
 *   - DATA_USER_ID              (entero; por defecto 0 — sesión anónima sin auth)
 */

const DEFAULT_DATA_API_URL = 'http://localhost:5000';
const DEFAULT_TIMEOUT_MS = 4000;
const DEFAULT_USER_ID = 0;

/** ¿Está habilitado el recomendador de Data como fuente principal? */
export function isDataRecommenderEnabled() {
  return process.env.DATA_RECOMMENDER_ENABLED === 'true';
}

/**
 * id_user a enviar a Data. Sin auth todavía, se usa un id anónimo configurable.
 * Data tolera un id sin historial: degrada a recomendación semántica pura.
 * @returns {number}
 */
export function getDataUserId() {
  const n = Number(process.env.DATA_USER_ID);
  return Number.isInteger(n) ? n : DEFAULT_USER_ID;
}

/**
 * Llama a `POST {DATA_API_URL}/recomendar` con la consulta libre y los filtros.
 * Lanza un error si la respuesta no es 2xx o si se supera el timeout.
 *
 * @param {{ consulta?: string, filtros?: Record<string, boolean>, idUser?: number }} [payload={}]
 * @returns {Promise<unknown>} JSON parseado de la respuesta de Data
 */
export async function fetchDataRecomendar({ consulta = '', filtros = {}, idUser } = {}) {
  const baseUrl = process.env.DATA_API_URL || DEFAULT_DATA_API_URL;
  const timeoutMs = Number(process.env.DATA_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL('/recomendar', baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        id_user: idUser ?? getDataUserId(),
        consulta,
        filtros,
      }),
      signal: controller.signal,
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

export default { isDataRecommenderEnabled, getDataUserId, fetchDataRecomendar };
