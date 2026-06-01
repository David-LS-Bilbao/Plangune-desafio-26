import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';
import { getAllActivities } from '../services/activity.service.js';

const app = createApp();
const activityId = getAllActivities()[0].id;

// Favoritos: almacenamiento en memoria (un único usuario mock).
// Los tests comparten el estado del proceso, por lo que se ejecutan en orden.
describe('Favoritos', () => {
  it('POST /api/favorites/:activityId añade (201) y aparece en GET', async () => {
    const add = await request(app).post(`/api/favorites/${activityId}`);
    expect(add.status).toBe(201);
    expect(add.body).toMatchObject({ activityId, favorited: true });

    const list = await request(app).get('/api/favorites');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.some((a) => a.id === activityId)).toBe(true);
  });

  it('DELETE /api/favorites/:activityId quita (200) y desaparece de GET', async () => {
    await request(app).post(`/api/favorites/${activityId}`); // asegura que está

    const del = await request(app).delete(`/api/favorites/${activityId}`);
    expect(del.status).toBe(200);
    expect(del.body).toMatchObject({ activityId, favorited: false });

    const list = await request(app).get('/api/favorites');
    expect(list.body.some((a) => a.id === activityId)).toBe(false);
  });

  it('POST a una actividad inexistente responde 404', async () => {
    const res = await request(app).post('/api/favorites/no-existe-999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
