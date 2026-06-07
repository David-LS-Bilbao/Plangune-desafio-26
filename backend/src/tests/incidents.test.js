import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';
import { getAllActivities } from '../services/activity.service.js';

const app = createApp();
const activityId = getAllActivities()[0].id;

describe('POST /api/incidents', () => {
  // Cubre creación, validación de payload y referencia a actividad inexistente.
  it('crea una incidencia (201) para una actividad existente', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({ activityId, type: 'datos-incorrectos', description: 'El horario no coincide' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ activityId, type: 'datos-incorrectos', status: 'open' });
    expect(res.body).toHaveProperty('id');
  });

  it('rechaza una incidencia sin type con 422', async () => {
    const res = await request(app).post('/api/incidents').send({ activityId });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('responde 404 si la actividad no existe', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .send({ activityId: 'no-existe-999', type: 'datos-incorrectos' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
