import { describe, it, expect } from 'vitest';

import {
  serializeEvent,
  toNumberOrNull,
  toIsoOrNull,
} from '../utils/serializeEvent.js';

describe('toNumberOrNull', () => {
  it('mantiene un number nativo', () => {
    expect(toNumberOrNull(43.2645)).toBe(43.2645);
  });

  it('convierte un string numérico (Decimal serializado) a number', () => {
    expect(toNumberOrNull('12.5')).toBe(12.5);
  });

  it('convierte un objeto con toString() (Prisma Decimal) a number', () => {
    const decimalLike = { toString: () => '8' };
    expect(toNumberOrNull(decimalLike)).toBe(8);
  });

  it('devuelve null para null y undefined', () => {
    expect(toNumberOrNull(null)).toBe(null);
    expect(toNumberOrNull(undefined)).toBe(null);
  });
});

describe('toIsoOrNull', () => {
  it('convierte un Date a ISO string', () => {
    const date = new Date('2026-06-10T10:00:00.000Z');
    expect(toIsoOrNull(date)).toBe('2026-06-10T10:00:00.000Z');
  });

  it('mantiene un string (ya ISO) tal cual', () => {
    expect(toIsoOrNull('2026-06-10T10:00:00')).toBe('2026-06-10T10:00:00');
  });

  it('devuelve null para null y undefined', () => {
    expect(toIsoOrNull(null)).toBe(null);
    expect(toIsoOrNull(undefined)).toBe(null);
  });
});

describe('serializeEvent', () => {
  it('normaliza tipos sin cambiar ni eliminar campos', () => {
    const raw = {
      id: 1,
      title: 'Exposición',
      municipio: 'Bilbao',
      es_carrito: true,
      lat: { toString: () => '43.2645' },      // simula Prisma Decimal
      lng: { toString: () => '-2.9342' },
      edad_minima: { toString: () => '0' },
      multiplicador: { toString: () => '1' },
      fecha_inicio: new Date('2026-06-10T10:00:00.000Z'),
      fecha_fin: null,
    };

    const result = serializeEvent(raw);

    // Tipos convertidos
    expect(result.lat).toBe(43.2645);
    expect(result.lng).toBe(-2.9342);
    expect(result.edad_minima).toBe(0);
    expect(result.multiplicador).toBe(1);
    expect(result.fecha_inicio).toBe('2026-06-10T10:00:00.000Z');
    expect(result.fecha_fin).toBe(null);

    // Campos no convertidos se mantienen intactos
    expect(result.id).toBe(1);
    expect(result.title).toBe('Exposición');
    expect(result.municipio).toBe('Bilbao');
    expect(result.es_carrito).toBe(true);

    // No se eliminan campos: mismas claves
    expect(Object.keys(result).sort()).toEqual(Object.keys(raw).sort());
  });

  it('es no-op sobre un evento mock con tipos ya nativos', () => {
    const mock = {
      id: 2,
      title: 'Playa',
      lat: 43.3389,
      lng: -3.0167,
      edad_minima: 3,
      multiplicador: 1.0,
      fecha_inicio: '2026-06-15T11:00:00',
      fecha_fin: null,
    };

    const result = serializeEvent(mock);

    expect(result.lat).toBe(43.3389);
    expect(result.edad_minima).toBe(3);
    expect(result.fecha_inicio).toBe('2026-06-15T11:00:00');
    expect(result.fecha_fin).toBe(null);
  });
});
