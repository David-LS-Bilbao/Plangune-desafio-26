import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';
import { getApprovedActivities } from '../services/activity.service.js';

const app = createApp();
// id de una actividad aprobada real (evita acoplar el test a un id concreto).
const approvedId = getApprovedActivities()[0].id;

describe('GET /api/activities', () => {
  it('responde 200 con un array', async () => {
    const res = await request(app).get('/api/activities');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('solo devuelve actividades approved y excluye la pending act-006', async () => {
    const res = await request(app).get('/api/activities');

    expect(res.body.every((a) => a.status === 'approved')).toBe(true);
    expect(res.body.some((a) => a.id === 'act-006')).toBe(false);
  });
});

describe('GET /api/activities/:id', () => {
  it('responde 200 para una actividad approved existente', async () => {
    const res = await request(app).get(`/api/activities/${approvedId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(approvedId);
  });

  it('responde 404 para la actividad pendiente act-006', async () => {
    const res = await request(app).get('/api/activities/act-006');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('responde 404 para un id inexistente', async () => {
    const res = await request(app).get('/api/activities/no-existe-999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
