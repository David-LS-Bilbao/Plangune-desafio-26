import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';
import { mockEvents } from '../seed/mockEvents.js';

const app = createApp();

describe('GET /api/events', () => {
  it('responde 200 y un array de eventos', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(mockEvents.length);
  });

  it('filtra por territorio (devuelve solo coincidencias, subconjunto)', async () => {
    const res = await request(app).get('/api/events?territorio=Bizkaia');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThan(mockEvents.length);
    expect(res.body.every((ev) => ev.territorio === 'Bizkaia')).toBe(true);
  });

  it('filtra por municipio (case-insensitive)', async () => {
    const res = await request(app).get('/api/events?municipio=bilbao');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((ev) => ev.municipio === 'Bilbao')).toBe(true);
  });

  it('filtra por es_carrito=true', async () => {
    const res = await request(app).get('/api/events?es_carrito=true');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((ev) => ev.es_carrito === true)).toBe(true);
  });

  it('filtra por edad (apto si edad_minima <= edad)', async () => {
    const res = await request(app).get('/api/events?edad=2');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((ev) => (ev.edad_minima ?? 0) <= 2)).toBe(true);
  });

  it('filtra por rango de fechas sobre fecha_inicio', async () => {
    const res = await request(app).get(
      '/api/events?fecha_desde=2026-07-01&fecha_hasta=2026-07-31',
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThan(mockEvents.length);
    expect(
      res.body.every((ev) => {
        const inicio = new Date(ev.fecha_inicio);
        return inicio >= new Date('2026-07-01') && inicio <= new Date('2026-07-31');
      }),
    ).toBe(true);
  });

  it('combina filtros (territorio + es_cambiador)', async () => {
    const res = await request(app).get('/api/events?territorio=Gipuzkoa&es_cambiador=true');

    expect(res.status).toBe(200);
    expect(
      res.body.every((ev) => ev.territorio === 'Gipuzkoa' && ev.es_cambiador === true),
    ).toBe(true);
  });

  it('rechaza un filtro booleano inválido con 422', async () => {
    const res = await request(app).get('/api/events?es_carrito=quizas');

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('rechaza una edad no numérica con 422', async () => {
    const res = await request(app).get('/api/events?edad=abc');

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/events/:id', () => {
  it('responde 200 con el evento si existe', async () => {
    const existing = mockEvents[0];

    const res = await request(app).get(`/api/events/${existing.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(existing.id);
    expect(res.body.title).toBe(existing.title);
  });

  it('responde 404 si el evento no existe', async () => {
    const res = await request(app).get('/api/events/999999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
