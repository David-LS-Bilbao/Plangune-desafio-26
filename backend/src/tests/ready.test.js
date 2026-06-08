/**
 * Tests de GET /api/ready (readiness con comprobación real de DB vía Prisma).
 * Prisma se mockea: no requiere PostgreSQL real. No debe exponer detalles de error.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

// El controller usa el import por defecto de config/prisma.js. Default y named comparten
// el MISMO objeto para que el test configure el mismo $queryRaw que ejecuta el controller.
vi.mock('../config/prisma.js', () => {
  const prisma = { $queryRaw: vi.fn() };
  return { default: prisma, prisma };
});

import request from 'supertest';

import { createApp } from '../app.js';
import prisma from '../config/prisma.js';

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/ready', () => {
  it('DB responde → 200 { status: ready, database: ok }', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app).get('/api/ready');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ready', database: 'ok' });
  });

  it('DB falla → 503 { status: not_ready, database: unavailable } sin filtrar detalles', async () => {
    prisma.$queryRaw.mockRejectedValue(
      new Error('connect ECONNREFUSED 127.0.0.1:5432 internal=secreto'),
    );

    const res = await request(app).get('/api/ready');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'not_ready', database: 'unavailable' });
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toMatch(/ECONNREFUSED|secreto|stack|5432/i);
  });
});
