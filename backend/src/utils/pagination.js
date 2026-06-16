/**
 * Paginación segura para listados (p. ej. /api/events).
 * Garantiza un límite duro: la API pública NUNCA devuelve resultados ilimitados.
 */
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

/**
 * Normaliza `page`/`limit` de la query a valores seguros y calcula `skip`/`take`.
 *  - page:  entero >= 1 (por defecto 1).
 *  - limit: entero entre 1 y MAX_LIMIT (por defecto DEFAULT_LIMIT; se capa a MAX_LIMIT).
 * Entradas inválidas/ausentes usan los valores por defecto (no lanza 422; clamping suave).
 *
 * @param {object} [query={}]
 * @returns {{ page: number, limit: number, skip: number, take: number }}
 */
export function parsePagination(query = {}) {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  let limit = Number.isInteger(rawLimit) && rawLimit >= 1 ? rawLimit : DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export default parsePagination;
