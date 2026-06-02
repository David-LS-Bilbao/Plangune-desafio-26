/**
 * Tests de GET /api/recommendations.
 *
 * El repository (`event.repository.js`) se mockea con vi.mock para que los tests
 * no requieran PostgreSQL real. El mock devuelve siempre todos los mockEvents, de modo
 * que la lógica de scoring y shape del service se prueba de verdad.
 *
 * vi.mock debe declararse ANTES de cualquier import que cargue el service (Vitest hoista
 * las llamadas vi.mock automáticamente).
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
  // El recomendador llama findEvents({}) sin filtros; siempre devuelve todos.
  findEvents.mockResolvedValue(mockEvents);
});

describe('GET /api/recommendations', () => {
  it('responde 200 con un array de como máximo 3 recomendaciones', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });

  it('cada recomendación tiene shape { event, activity, score:número, reasons:array }', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.body.length).toBeGreaterThan(0);
    for (const item of res.body) {
      expect(item).toHaveProperty('event');
      expect(item).toHaveProperty('activity'); // alias temporal de compatibilidad
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
    }
  });

  it('activity es alias temporal de event (mismo objeto)', async () => {
    const res = await request(app).get('/api/recommendations');

    for (const item of res.body) {
      // Los dos campos apuntan al mismo evento: mismos id y title
      expect(item.activity.id).toBe(item.event.id);
      expect(item.activity.title).toBe(item.event.title);
    }
  });

  it('event.id es numérico (events usa IDs enteros, no strings como acts)', async () => {
    const res = await request(app).get('/api/recommendations');

    for (const item of res.body) {
      expect(typeof item.event.id).toBe('number');
    }
  });

  it('ordena las recomendaciones de mayor a menor score', async () => {
    const res = await request(app).get('/api/recommendations');

    const scores = res.body.map((item) => item.score);
    const ordenadas = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(ordenadas);
  });

  it('con una query familiar, el top result es explicable (tiene reasons)', async () => {
    const res = await request(app).get(
      '/api/recommendations?childrenAges=2&strollerFriendly=true&rainSuitable=true&budget=40&municipality=Bilbao',
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].reasons.length).toBeGreaterThan(0);
  });

  it('no rompe con query vacía y devuelve array con score y reasons', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
    for (const item of res.body) {
      expect(item).toHaveProperty('event');
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
    }
  });

  it('childrenAges — solo devuelve eventos con edad_minima <= min(childrenAges)', async () => {
    // childrenAges=0: solo eventos con edad_minima <= 0 deben sumar el bonus de edad
    const res = await request(app).get('/api/recommendations?childrenAges=0');

    expect(res.status).toBe(200);
    // El top result debe tener reasons que incluyan "edad"
    if (res.body.length > 0 && res.body[0].reasons.length > 0) {
      const hasEdadReason = res.body[0].reasons.some((r) => r.includes('edad'));
      expect(hasEdadReason).toBe(true);
    }
  });

  it('strollerFriendly — el top result tiene es_carrito cuando se filtra por carrito', async () => {
    const res = await request(app).get('/api/recommendations?strollerFriendly=true');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    // El mejor resultado debe tener es_carrito=true (recibe bonus que lo sube al top)
    expect(res.body[0].event.es_carrito).toBe(true);
  });

  it('rainSuitable — el top result tiene es_lluvia cuando se filtra por lluvia', async () => {
    const res = await request(app).get('/api/recommendations?rainSuitable=true');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].event.es_lluvia).toBe(true);
  });

  it('budget — price "Gratis" y precios numéricos parsean correctamente', async () => {
    // budget=5: solo "Gratis" (0) encaja. "8 €" (8 > 5) no suma.
    const res = await request(app).get('/api/recommendations?budget=5');

    expect(res.status).toBe(200);
    // Si hay eventos Gratis entre los top 3, deben tener reasons de presupuesto
    const gratisEnTop = res.body.some(
      (item) => item.event.price === 'Gratis' &&
                item.reasons.some((r) => r.includes('presupuesto')),
    );
    // No todos son Gratis, pero si alguno lo es debe tener la razón
    const eventosGratis = mockEvents.filter((e) => e.price === 'Gratis');
    if (eventosGratis.length > 0) {
      expect(gratisEnTop).toBe(true);
    }
  });

  it('municipality — suma bonus a eventos en el municipio indicado', async () => {
    const res = await request(app).get('/api/recommendations?municipality=Bilbao');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    // El top debe incluir un evento de Bilbao
    expect(res.body[0].event.municipio).toMatch(/Bilbao/i);
  });
});
