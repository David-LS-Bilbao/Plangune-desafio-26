/**
 * Tests de la validación de entorno al arrancar (config/env.js).
 * No se imprime ni se filtra ningún valor de secreto en los errores.
 */
import { describe, it, expect } from 'vitest';

import { validateEnv } from '../config/env.js';

const PROD_OK = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:pass@db:5432/app',
  JWT_SECRET: 'x'.repeat(40),
  CLIENT_URL: 'https://plangune.example',
};

describe('validateEnv', () => {
  it('production válido → no lanza y devuelve isProduction', () => {
    expect(validateEnv({ ...PROD_OK })).toEqual({ nodeEnv: 'production', isProduction: true });
  });

  it('production sin DATABASE_URL ni JWT_SECRET → lanza listando ambas (orden estable)', () => {
    const env = { NODE_ENV: 'production', CLIENT_URL: 'https://x.example' };
    expect(() => validateEnv(env)).toThrow(
      /Missing required production environment variables: DATABASE_URL, JWT_SECRET/,
    );
  });

  it('production con JWT_SECRET demasiado corto (<32) → lanza', () => {
    expect(() => validateEnv({ ...PROD_OK, JWT_SECRET: 'too-short' })).toThrow(
      /JWT_SECRET is too short/,
    );
  });

  it('production con JWT_SECRET placeholder → lanza', () => {
    expect(() =>
      validateEnv({ ...PROD_OK, JWT_SECRET: 'replace_with_32_plus_random_chars' }),
    ).toThrow(/placeholder/i);
  });

  it('production sin CLIENT_URL → lanza mencionándolo', () => {
    const env = { ...PROD_OK };
    delete env.CLIENT_URL;
    expect(() => validateEnv(env)).toThrow(/CLIENT_URL/);
  });

  it('development sin variables → no bloquea el arranque', () => {
    expect(validateEnv({ NODE_ENV: 'development' })).toEqual({
      nodeEnv: 'development',
      isProduction: false,
    });
  });

  it('sin NODE_ENV → trata como development (no lanza)', () => {
    expect(validateEnv({})).toMatchObject({ isProduction: false });
  });

  it('el mensaje de error NUNCA incluye el valor del secreto', () => {
    const secret = 'valor-secreto-larguísimo-1234567890-abcdefghij';
    // Secreto válido en longitud; forzamos otro fallo (falta DATABASE_URL) para inspeccionar el msg.
    const env = { NODE_ENV: 'production', JWT_SECRET: secret, CLIENT_URL: 'https://x.example' };
    try {
      validateEnv(env);
      throw new Error('debería haber lanzado');
    } catch (err) {
      expect(err.message).toMatch(/DATABASE_URL/);
      expect(err.message).not.toContain(secret);
    }
  });
});
