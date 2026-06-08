/**
 * Tests de la paginación segura (utils/pagination.js).
 * Garantiza límite por defecto y máximo duro; entradas inválidas → defaults.
 */
import { describe, it, expect } from 'vitest';

import { parsePagination, DEFAULT_LIMIT, MAX_LIMIT } from '../utils/pagination.js';

describe('parsePagination', () => {
  it('sin query → page 1, limit por defecto, skip 0', () => {
    expect(parsePagination()).toEqual({
      page: 1,
      limit: DEFAULT_LIMIT,
      skip: 0,
      take: DEFAULT_LIMIT,
    });
  });

  it('page/limit válidos → calcula skip y take', () => {
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
      take: 10,
    });
  });

  it('limit por encima del máximo → se capa a MAX_LIMIT', () => {
    expect(parsePagination({ limit: '1000' })).toMatchObject({ limit: MAX_LIMIT, take: MAX_LIMIT });
  });

  it('entradas inválidas (0, negativos, texto) → valores por defecto', () => {
    expect(parsePagination({ page: '0', limit: '-5' })).toMatchObject({
      page: 1,
      limit: DEFAULT_LIMIT,
    });
    expect(parsePagination({ page: 'abc', limit: 'xyz' })).toMatchObject({
      page: 1,
      limit: DEFAULT_LIMIT,
    });
  });

  it('nunca devuelve un take mayor que MAX_LIMIT', () => {
    for (const limit of ['51', '100', '99999']) {
      expect(parsePagination({ limit }).take).toBeLessThanOrEqual(MAX_LIMIT);
    }
  });
});
