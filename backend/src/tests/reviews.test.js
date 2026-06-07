import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';
import { getAllActivities } from '../services/activity.service.js';

const app = createApp();
const activityId = getAllActivities()[0].id;

describe('POST /api/reviews', () => {
  // Cubre creación, rango de rating y referencia a actividad inexistente.
  it('crea una reseña (201) para una actividad existente', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ activityId, rating: 5, comment: 'Genial para ir con carrito' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ activityId, rating: 5, status: 'pending' });
    expect(res.body).toHaveProperty('id');
  });

  it('rechaza un rating fuera de rango con 422', async () => {
    const res = await request(app).post('/api/reviews').send({ activityId, rating: 9 });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('responde 404 si la actividad no existe', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ activityId: 'no-existe-999', rating: 4 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
