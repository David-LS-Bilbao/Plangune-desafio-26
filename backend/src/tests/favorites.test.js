/**
 * Tests de favoritos sobre eventos reales (/api/favorites).
 *
 * Se mockean los repositorios (`favorite.repository.js` y `event.repository.js`) para que
 * los tests NO requieran PostgreSQL. El mock de favoritos usa un Set en memoria que replica
 * la idempotencia de la tabla `user_favorite_events`.
 *
 * Los vi.mock se declaran ANTES de importar createApp (Vitest hoista las llamadas vi.mock).
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../repositories/favorite.repository.js', () => ({
  listFavoriteEventsByUser: vi.fn(),
  addFavoriteEvent:         vi.fn(),
  removeFavoriteEvent:      vi.fn(),
}));

vi.mock('../repositories/event.repository.js', () => ({
  findEvents:    vi.fn(),
  findEventById: vi.fn(),
}));

import request from 'supertest';

import { createApp } from '../app.js';
import { mockEvents } from '../seed/mockEvents.js';
import { findEventById } from '../repositories/event.repository.js';
import {
  listFavoriteEventsByUser,
  addFavoriteEvent,
  removeFavoriteEvent,
} from '../repositories/favorite.repository.js';

const app = createApp();

// Set en memoria que simula la tabla user_favorite_events para el usuario mock.
let favSet;

beforeEach(() => {
  favSet = new Set();

  // event.repository: el evento existe si está en mockEvents.
  findEventById.mockImplementation(async (id) => mockEvents.find((e) => e.id === id) ?? null);

  // favorite.repository: idempotente sobre el Set.
  addFavoriteEvent.mockImplementation(async (_userId, eventId) => {
    favSet.add(eventId);
  });
  removeFavoriteEvent.mockImplementation(async (_userId, eventId) => {
    const had = favSet.has(eventId);
    favSet.delete(eventId);
    return had;
  });
  listFavoriteEventsByUser.mockImplementation(async () =>
    [...favSet].map((id) => mockEvents.find((e) => e.id === id)).filter(Boolean),
  );
});

const EXISTING_ID = mockEvents[0].id; // id numérico real

describe('Favoritos (events reales)', () => {
  it('POST /api/favorites/:id añade (201) con eventId + activityId y aparece en GET', async () => {
    const add = await request(app).post(`/api/favorites/${EXISTING_ID}`);
    expect(add.status).toBe(201);
    expect(add.body).toMatchObject({ eventId: EXISTING_ID, activityId: EXISTING_ID, favorited: true });

    const list = await request(app).get('/api/favorites');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.some((ev) => ev.id === EXISTING_ID)).toBe(true);
  });

  it('DELETE /api/favorites/:id quita (200) con removed:true y desaparece de GET', async () => {
    await request(app).post(`/api/favorites/${EXISTING_ID}`); // asegura que está

    const del = await request(app).delete(`/api/favorites/${EXISTING_ID}`);
    expect(del.status).toBe(200);
    expect(del.body).toMatchObject({
      eventId: EXISTING_ID,
      activityId: EXISTING_ID,
      favorited: false,
      removed: true,
    });

    const list = await request(app).get('/api/favorites');
    expect(list.body.some((ev) => ev.id === EXISTING_ID)).toBe(false);
  });

  it('POST a un evento inexistente responde 404', async () => {
    const res = await request(app).post('/api/favorites/999999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('POST es idempotente: añadir dos veces no duplica ni falla', async () => {
    const first = await request(app).post(`/api/favorites/${EXISTING_ID}`);
    const second = await request(app).post(`/api/favorites/${EXISTING_ID}`);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const list = await request(app).get('/api/favorites');
    const matches = list.body.filter((ev) => ev.id === EXISTING_ID);
    expect(matches.length).toBe(1);
  });

  it('DELETE es idempotente: quitar algo no presente no falla (removed:false)', async () => {
    const del = await request(app).delete(`/api/favorites/${EXISTING_ID}`);

    expect(del.status).toBe(200);
    expect(del.body).toMatchObject({ eventId: EXISTING_ID, favorited: false, removed: false });
  });

  it('la respuesta contiene eventId y activityId (compatibilidad legacy)', async () => {
    const add = await request(app).post(`/api/favorites/${EXISTING_ID}`);

    expect(add.body).toHaveProperty('eventId', EXISTING_ID);
    expect(add.body).toHaveProperty('activityId', EXISTING_ID);
  });

  it('GET devuelve eventos reales con shape de event (no activities mock)', async () => {
    await request(app).post(`/api/favorites/${EXISTING_ID}`);

    const list = await request(app).get('/api/favorites');
    const fav = list.body.find((ev) => ev.id === EXISTING_ID);

    expect(fav).toBeDefined();
    // Campos propios de la tabla events (snake_case)
    expect(fav).toHaveProperty('title');
    expect(fav).toHaveProperty('municipio');
    expect(fav).toHaveProperty('es_carrito');
    expect(typeof fav.id).toBe('number');
  });
});
