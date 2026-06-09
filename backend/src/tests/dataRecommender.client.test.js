import { describe, it, expect } from 'vitest';

import { sanitizeNonFiniteJson } from '../clients/dataRecommender.client.js';

describe('sanitizeNonFiniteJson', () => {
  it('sustituye NaN por null en posición de valor (caso real de Data)', () => {
    const raw = '{"imagen_url":NaN,"multiplicador":1.2}';
    const parsed = JSON.parse(sanitizeNonFiniteJson(raw));
    expect(parsed.imagen_url).toBeNull();
    expect(parsed.multiplicador).toBe(1.2);
  });

  it('sustituye Infinity y -Infinity por null', () => {
    const parsed = JSON.parse(sanitizeNonFiniteJson('{"a":Infinity,"b":-Infinity}'));
    expect(parsed.a).toBeNull();
    expect(parsed.b).toBeNull();
  });

  it('sanea NaN dentro de arrays', () => {
    expect(JSON.parse(sanitizeNonFiniteJson('{"v":[NaN,1,NaN]}')).v).toEqual([null, 1, null]);
  });

  it('NO toca el token NaN si aparece dentro de un string entrecomillado', () => {
    const parsed = JSON.parse(sanitizeNonFiniteJson('{"title":"Concierto NaN Jazz"}'));
    expect(parsed.title).toBe('Concierto NaN Jazz');
  });

  it('deja intacto el JSON ya válido', () => {
    const valid = '{"a":1,"b":"texto","c":null,"d":[1,2]}';
    expect(sanitizeNonFiniteJson(valid)).toBe(valid);
  });
});
