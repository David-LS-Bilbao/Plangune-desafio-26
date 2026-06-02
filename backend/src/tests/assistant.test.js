/**
 * Tests de POST /api/assistant/family-plan.
 *
 * El assistant reutiliza getRecommendations, que ahora consulta Prisma/PostgreSQL.
 * Se mockea event.repository.js para que los tests no requieran DB real.
 *
 * vi.mock debe declararse ANTES de cualquier import que cargue el service.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../repositories/event.repository.js', () => ({
  findEvents:    vi.fn(),
  findEventById: vi.fn(),
}));

import request from 'supertest';

import { createApp } from '../app.js';
import { mockEvents } from '../seed/mockEvents.js';
import { findEvents } from '../repositories/event.repository.js';

const app = createApp();

beforeEach(() => {
  findEvents.mockResolvedValue(mockEvents);
});

describe('POST /api/assistant/family-plan', () => {
  it('responde 200 con un plan en modo fallback', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'Plan a cubierto para un peque de 3 años', childrenAges: [3], rainSuitable: true });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
  });

  it('devuelve recommendations como array de como máximo 3, con shape mínimo', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ childrenAges: [2], municipality: 'Bilbao', budget: 40 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations.length).toBeLessThanOrEqual(3);
    for (const item of res.body.recommendations) {
      expect(item).toHaveProperty('activity');
      expect(item).toHaveProperty('event');
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
    }
  });

  it('acepta un body vacío (todos los campos opcionales) y responde 200 fallback', async () => {
    const res = await request(app).post('/api/assistant/family-plan').send({});

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  it('rechaza un message de más de 500 caracteres con 422', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'x'.repeat(501) });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });
});
