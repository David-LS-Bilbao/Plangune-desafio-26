/**
 * Tests de /api/events.
 *
 * El repository (Prisma) se mockea con vi.mock para que los tests no requieran
 * una base de datos real. El mock replica el filtrado sobre mockEvents, actuando
 * como la "DB en memoria" de pruebas. La lógica real del service (serialización,
 * 404, parseo de filtros) y la capa HTTP (validación, routing) se prueban de verdad.
 *
 * vi.mock debe declararse ANTES de cualquier import que cargue el service, ya que
 * Vitest hoista automáticamente las llamadas vi.mock al inicio del módulo.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock del repository — declarado primero para que el hoisting de Vitest lo aplique
// antes de que se cargue event.service.js (que importa event.repository.js).
vi.mock('../repositories/event.repository.js', () => ({
  findEvents:    vi.fn(),
  findEventById: vi.fn(),
}));

import request from 'supertest';

import { createApp } from '../app.js';
import { mockEvents } from '../seed/mockEvents.js';
import { findEvents, findEventById } from '../repositories/event.repository.js';

const app = createApp();

// ---------------------------------------------------------------------------
// Implementación de filtrado en memoria para el mock del repository.
// Replica la semántica que construye buildWhere() en el repository real.
// ---------------------------------------------------------------------------
function filterMockEvents(filters = {}) {
  return mockEvents.filter((ev) => {
    if (filters.municipio   && ev.municipio?.toLowerCase()   !== filters.municipio.toLowerCase())   return false;
    if (filters.territorio  && ev.territorio?.toLowerCase()  !== filters.territorio.toLowerCase())  return false;
    if (filters.categoria   && ev.categoria?.toLowerCase()   !== filters.categoria.toLowerCase())   return false;
    if (filters.tipo_evento && ev.tipo_evento?.toLowerCase() !== filters.tipo_evento.toLowerCase()) return false;

    if (filters.es_interior    !== undefined && ev.es_interior    !== filters.es_interior)    return false;
    if (filters.es_carrito   !== undefined && ev.es_carrito   !== filters.es_carrito)   return false;
    if (filters.es_cambiador !== undefined && ev.es_cambiador !== filters.es_cambiador) return false;
    if (filters.es_silla_ruedas !== undefined && ev.es_silla_ruedas !== filters.es_silla_ruedas) return false;
    if (filters.es_mascotas !== undefined && ev.es_mascotas !== filters.es_mascotas) return false;

    if (filters.edad !== undefined && (ev.edad_minima ?? 0) > filters.edad) return false;

    if (filters.fecha_desde && new Date(ev.fecha_inicio) < new Date(filters.fecha_desde)) return false;
    if (filters.fecha_hasta && new Date(ev.fecha_inicio) > new Date(filters.fecha_hasta)) return false;

    return true;
  });
}

beforeEach(() => {
  findEvents.mockImplementation(async (filters) => filterMockEvents(filters));
  findEventById.mockImplementation(async (id) => mockEvents.find((ev) => ev.id === id) ?? null);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/events', () => {
  it('responde 200 y un array de eventos', async () => {
    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(mockEvents.length);
  });

  it('por defecto reenvía un take seguro (límite duro) al repositorio', async () => {
    await request(app).get('/api/events');

    const [, pagination] = findEvents.mock.calls.at(-1);
    expect(pagination).toMatchObject({ skip: 0, take: 20 });
    expect(pagination.take).toBeLessThanOrEqual(50);
  });

  it('reenvía page/limit como skip/take al repositorio', async () => {
    await request(app).get('/api/events?page=2&limit=5');

    const [, pagination] = findEvents.mock.calls.at(-1);
    expect(pagination).toMatchObject({ skip: 5, take: 5 });
  });

  it('capa limit por encima del máximo a 50', async () => {
    await request(app).get('/api/events?limit=9999');

    const [, pagination] = findEvents.mock.calls.at(-1);
    expect(pagination.take).toBe(50);
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

  it('filtra por es_interior=true (plan a cubierto)', async () => {
    const res = await request(app).get('/api/events?es_interior=true');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((ev) => ev.es_interior === true)).toBe(true);
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

  it('filtra por es_silla_ruedas=true (accesible con silla de ruedas)', async () => {
    const res = await request(app).get('/api/events?es_silla_ruedas=true');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThan(mockEvents.length);
    expect(res.body.every((ev) => ev.es_silla_ruedas === true)).toBe(true);
  });

  it('filtra por es_silla_ruedas=false (no accesible con silla de ruedas)', async () => {
    const res = await request(app).get('/api/events?es_silla_ruedas=false');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThan(mockEvents.length);
    expect(res.body.every((ev) => ev.es_silla_ruedas === false)).toBe(true);
  });

  it('filtra por es_mascotas=true (admite mascotas)', async () => {
    const res = await request(app).get('/api/events?es_mascotas=true');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThan(mockEvents.length);
    expect(res.body.every((ev) => ev.es_mascotas === true)).toBe(true);
  });

  it('filtra por es_mascotas=false (no admite mascotas)', async () => {
    const res = await request(app).get('/api/events?es_mascotas=false');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.length).toBeLessThan(mockEvents.length);
    expect(res.body.every((ev) => ev.es_mascotas === false)).toBe(true);
  });

  it('rechaza un filtro booleano inválido con 422', async () => {
    const res = await request(app).get('/api/events?es_carrito=quizas');

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('rechaza es_silla_ruedas no booleano con 422', async () => {
    const res = await request(app).get('/api/events?es_silla_ruedas=quizas');

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('rechaza es_mascotas no booleano con 422', async () => {
    const res = await request(app).get('/api/events?es_mascotas=quizas');

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
