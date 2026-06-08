/**
 * Tests de GET /api/recommendations.
 *
 * Se mockean DOS módulos para no depender de Flask ni de PostgreSQL reales:
 *   - dataRecommender.client.js → controla si Data está habilitado y su respuesta.
 *   - event.repository.js        → datos del fallback local (mockEvents en memoria).
 *
 * Por defecto (beforeEach) Data está DESHABILITADO → el endpoint usa el fallback local.
 * Los bloques específicos de Data lo habilitan y controlan `fetchDataPlanes`.
 *
 * Los vi.mock se declaran ANTES de importar createApp (Vitest los hoista).
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../clients/dataRecommender.client.js', () => ({
  isDataRecommenderEnabled: vi.fn(),
  fetchDataPlanes: vi.fn(),
}));

vi.mock('../repositories/event.repository.js', () => ({
  findEvents: vi.fn(),
  findEventById: vi.fn(),
}));

import request from 'supertest';

import { createApp } from '../app.js';
import { mockEvents } from '../seed/mockEvents.js';
import { findEvents } from '../repositories/event.repository.js';
import { isDataRecommenderEnabled, fetchDataPlanes } from '../clients/dataRecommender.client.js';

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
  // Fallback local: el recomendador llama findEvents({}) y devuelve todos los eventos.
  findEvents.mockResolvedValue(mockEvents);
  // Por defecto Data deshabilitado → fallback local.
  isDataRecommenderEnabled.mockReturnValue(false);
});

// ---------------------------------------------------------------------------
// Fallback local (Data deshabilitado)
// ---------------------------------------------------------------------------

describe('GET /api/recommendations · fallback local (Data deshabilitado)', () => {
  it('responde 200 con un array de como máximo 3 recomendaciones', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });

  it('cada item tiene shape { event, activity, score:número, reasons:array, source:"local-fallback" }', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.body.length).toBeGreaterThan(0);
    for (const item of res.body) {
      expect(item).toHaveProperty('event');
      expect(item).toHaveProperty('activity'); // alias legacy
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
      expect(item.source).toBe('local-fallback');
    }
  });

  it('activity es alias legacy de event (mismo objeto)', async () => {
    const res = await request(app).get('/api/recommendations');

    for (const item of res.body) {
      expect(item.activity.id).toBe(item.event.id);
      expect(item.activity.title).toBe(item.event.title);
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

  it('no rompe con query vacía', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });

  it('strollerFriendly — el top result tiene es_carrito al filtrar por carrito', async () => {
    const res = await request(app).get('/api/recommendations?strollerFriendly=true');

    expect(res.status).toBe(200);
    expect(res.body[0].event.es_carrito).toBe(true);
  });

  it('municipality — el top result es del municipio indicado', async () => {
    const res = await request(app).get('/api/recommendations?municipality=Bilbao');

    expect(res.status).toBe(200);
    expect(res.body[0].event.municipio).toMatch(/Bilbao/i);
  });
});

// ---------------------------------------------------------------------------
// Data API como recomendador principal
// ---------------------------------------------------------------------------

describe('GET /api/recommendations · Data API principal', () => {
  // "Planes" simulados que devolvería Flask /planes.
  const dataPlanes = [
    { external_id: 'data-1', id: 101, title: 'Plan Data 1', municipio: 'Bilbao', score: 3 },
    { external_id: 'data-2', id: 102, title: 'Plan Data 2', municipio: 'Getxo', score: 2 },
  ];

  it('Data OK (array directo) → devuelve items con source "data-api"', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue(dataPlanes);

    const res = await request(app).get('/api/recommendations?municipality=Bilbao&childrenAges=2');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    for (const item of res.body) {
      expect(item.source).toBe('data-api');
      expect(item).toHaveProperty('event');
      expect(item).toHaveProperty('activity'); // alias legacy mantenido
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
    }
    // No se usó el fallback local cuando Data respondió bien.
    expect(findEvents).not.toHaveBeenCalled();
  });

  it('normaliza el shape crudo de Data al shape de events (title, booleanos, edad, id null)', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue([
      {
        nombre: 'Aizian',
        descripcion: 'Restaurante acogedor',
        direccion: 'Lehendakari Leizaola, 29',
        precio: null,
        municipio: 'Bilbao',
        territorio: 'bizkaia',
        es_carrito: true,
        es_lluvia: true,
        es_mascotas: 'False',
        es_silla_ruedas: 'True',
        edad_minima: '0',
        lat: 43.2675,
        lng: -2.9418,
        score: 1,
        reasons: ['Recomendado por el servicio Data'],
      },
    ]);

    const res = await request(app).get('/api/recommendations?municipality=Bilbao');

    expect(res.status).toBe(200);
    const item = res.body[0];
    // event con shape de events (no el crudo de Data)
    expect(item.event.title).toBe('Aizian');
    expect(item.event.nombre).toBeUndefined();
    expect(item.event.description).toBe('Restaurante acogedor');
    expect(item.event.address).toBe('Lehendakari Leizaola, 29');
    expect(item.event.es_interior).toBe(true); // desde es_lluvia
    expect(item.event.es_silla_ruedas).toBe(true); // "True" → true
    expect(item.event.es_mascotas).toBe(false); // "False" → false (no truthy)
    expect(typeof item.event.es_mascotas).toBe('boolean');
    expect(item.event.edad_minima).toBe(0);
    expect(typeof item.event.edad_minima).toBe('number');
    expect(item.event.id).toBeNull(); // Data sin id interno
    // alias legacy + metadatos preservados
    expect(item.activity).toEqual(item.event);
    expect(item.source).toBe('data-api');
    expect(typeof item.score).toBe('number');
    expect(Array.isArray(item.reasons)).toBe(true);
  });

  it('Data OK (shape { total, filtros, resultados }) → source "data-api"', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue({
      total: 2,
      filtros: { ubicacion: 'Bilbao' },
      resultados: dataPlanes,
    });

    const res = await request(app).get('/api/recommendations?municipality=Bilbao');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every((item) => item.source === 'data-api')).toBe(true);
    expect(res.body[0].activity.id).toBe(res.body[0].event.id); // alias legacy
    expect(findEvents).not.toHaveBeenCalled();
  });

  it('Data { resultados: [] } (sin resultados) → fallback local', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue({ total: 0, filtros: {}, resultados: [] });

    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(res.body.every((item) => item.source === 'local-fallback')).toBe(true);
  });

  it('el controller parsea los filtros adicionales y los envía a Data', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue(dataPlanes);

    await request(app).get(
      '/api/recommendations?municipality=Bilbao&childrenAges=2,5&strollerFriendly=true&rainSuitable=true' +
        '&changingTable=true&wheelchairAccessible=true&petsAllowed=true&includeKulturklik=true&limit=5',
    );

    expect(fetchDataPlanes).toHaveBeenCalledTimes(1);
    const params = fetchDataPlanes.mock.calls[0][0];
    // Filtros existentes mapeados
    expect(params.ubicacion).toBe('Bilbao');
    expect(params.edad_max).toBe(2); // min(childrenAges)
    expect(params.carrito).toBe(true);
    expect(params.lluvia).toBe(true);
    // Filtros adicionales mapeados al nombre de Data
    expect(params.cambiador).toBe(true);
    expect(params.silla_ruedas).toBe(true);
    expect(params.mascotas).toBe(true);
    expect(params.kulturklik).toBe(true);
    expect(params.limite).toBe(5);
  });

  it('Data OK → activity sigue siendo alias de event', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue(dataPlanes);

    const res = await request(app).get('/api/recommendations');

    expect(res.body[0].activity.id).toBe(res.body[0].event.id);
    expect(res.body[0].event.title).toBe('Plan Data 1');
  });

  it('Data timeout/error → fallback local (source local-fallback)', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    fetchDataPlanes.mockRejectedValue(abortError);

    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((item) => item.source === 'local-fallback')).toBe(true);
    expect(findEvents).toHaveBeenCalled(); // se usó el recomendador local
  });

  it('Data 503 → fallback local', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    const error = new Error('Data API respondió 503');
    error.status = 503;
    fetchDataPlanes.mockRejectedValue(error);

    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(res.body.every((item) => item.source === 'local-fallback')).toBe(true);
  });

  it('Data respuesta vacía (array vacío) → fallback local', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue([]);

    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((item) => item.source === 'local-fallback')).toBe(true);
  });

  it('Data respuesta inválida (no-array) → fallback local', async () => {
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue({ unexpected: 'shape' });

    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(res.body.every((item) => item.source === 'local-fallback')).toBe(true);
  });

  it('Data devuelve más de 3 planes sin limit → Express devuelve 3', async () => {
    const seisPlanes = Array.from({ length: 6 }, (_, i) => ({
      id: 200 + i,
      title: `Plan Data ${i + 1}`,
      score: 6 - i,
    }));
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue(seisPlanes);

    const res = await request(app).get('/api/recommendations?municipality=Bilbao');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3); // contrato estable: máx 3 por defecto
    expect(res.body.every((item) => item.source === 'data-api')).toBe(true);
    // A Data se le pidió limite=3 por defecto.
    expect(fetchDataPlanes.mock.calls[0][0].limite).toBe(3);
  });

  it('Data devuelve más de 5 planes con limit=5 → Express devuelve 5 y Data recibe limite=5', async () => {
    const sietePlanes = Array.from({ length: 7 }, (_, i) => ({
      id: 300 + i,
      title: `Plan Data ${i + 1}`,
      score: 7 - i,
    }));
    isDataRecommenderEnabled.mockReturnValue(true);
    fetchDataPlanes.mockResolvedValue(sietePlanes);

    const res = await request(app).get('/api/recommendations?municipality=Bilbao&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(5);
    expect(res.body.every((item) => item.source === 'data-api')).toBe(true);
    expect(fetchDataPlanes.mock.calls[0][0].limite).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// parsePrice / bonus de presupuesto (fallback local)
//
// Se ejercita a través del endpoint con eventos controlados en findEvents.
// La razón "Dentro del presupuesto (...)" solo aparece si el precio es conocido
// (número o "Gratis"). Un precio desconocido/no parseable NO da bonus: no se
// asume gratis.
// ---------------------------------------------------------------------------

describe('GET /api/recommendations · parsePrice y presupuesto (fallback local)', () => {
  // Evento mínimo válido para el recomendador local; price configurable por test.
  const buildEvent = (id, price) => ({
    id,
    title: `Evento ${id}`,
    municipio: 'Bilbao',
    edad_minima: 0,
    es_carrito: false,
    es_interior: false,
    price,
  });

  // Devuelve las reasons del item cuyo event.id coincide.
  const reasonsForEvent = (body, id) =>
    body.find((item) => item.event.id === id)?.reasons ?? [];

  it('"Gratis" se trata como 0 € → entra en presupuesto con etiqueta "Gratis"', async () => {
    findEvents.mockResolvedValue([buildEvent(1, 'Gratis')]);

    const res = await request(app).get('/api/recommendations?budget=10');

    expect(res.status).toBe(200);
    expect(reasonsForEvent(res.body, 1)).toContain('Dentro del presupuesto (Gratis)');
  });

  it('string con número se parsea → "Desde 12€" entra con budget 40 (etiqueta "12€")', async () => {
    findEvents.mockResolvedValue([buildEvent(2, 'Desde 12€')]);

    const res = await request(app).get('/api/recommendations?budget=40');

    expect(res.status).toBe(200);
    expect(reasonsForEvent(res.body, 2)).toContain('Dentro del presupuesto (12€)');
  });

  it('string con número por encima del presupuesto → sin bonus de presupuesto', async () => {
    findEvents.mockResolvedValue([buildEvent(3, 'Desde 12€')]);

    const res = await request(app).get('/api/recommendations?budget=5');

    expect(res.status).toBe(200);
    const reasons = reasonsForEvent(res.body, 3);
    expect(reasons.some((r) => r.startsWith('Dentro del presupuesto'))).toBe(false);
  });

  it('precio null (desconocido) → NO se trata como gratis: sin bonus de presupuesto', async () => {
    findEvents.mockResolvedValue([buildEvent(4, null)]);

    const res = await request(app).get('/api/recommendations?budget=10');

    expect(res.status).toBe(200);
    const reasons = reasonsForEvent(res.body, 4);
    expect(reasons.some((r) => r.startsWith('Dentro del presupuesto'))).toBe(false);
  });

  it('precio no parseable ("Consultar") → NO se trata como gratis: sin bonus de presupuesto', async () => {
    findEvents.mockResolvedValue([buildEvent(5, 'Consultar')]);

    const res = await request(app).get('/api/recommendations?budget=10');

    expect(res.status).toBe(200);
    const reasons = reasonsForEvent(res.body, 5);
    expect(reasons.some((r) => r.startsWith('Dentro del presupuesto'))).toBe(false);
  });
});
