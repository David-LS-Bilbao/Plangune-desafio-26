import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

// JWT_SECRET de prueba: las utilidades JWT lo leen en cada llamada.
process.env.JWT_SECRET = 'test-secret-reviews-strong-value-32';

import { createApp } from '../app.js';
import { signToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

const app = createApp();

let testUser;
let authHeader;
let activityId;

beforeAll(async () => {
  // Obtenemos un evento real de la base de datos para usar su ID numérico
  const realEvent = await prisma.event.findFirst();
  if (!realEvent) {
    throw new Error('No hay eventos en la base de datos de pruebas. Corre los seeds primero.');
  }
  activityId = realEvent.id;

  // Crea un usuario real en la DB para que PostgreSQL no de fallo de Foreign Key (P2003)
  testUser = await prisma.user.create({
    data: {
      email: `test-reviewer-${Date.now()}@demo.com`,
      password: 'fakehash',
      role: 'family'
    }
  });
  
  const token = signToken({ sub: testUser.id, role: 'family' });
  authHeader = `Bearer ${token}`;
});

afterAll(async () => {
  if (testUser) {
    // Limpieza
    await prisma.review.deleteMany({ where: { user_id: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  }
});

describe('POST /api/reviews', () => {
  // Cubre creación, rango de rating y referencia a actividad inexistente.
  it('crea una reseña (201) para una actividad existente', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ activityId, rating: 5, comment: 'Genial para ir con carrito' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ event_id: activityId, rating: 5 });
    expect(res.body).toHaveProperty('id');
  });

  it('rechaza un rating fuera de rango con 422', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ activityId, rating: 9 });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('responde 404 si la actividad no existe', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', authHeader)
      .send({ activityId: 'no-existe-999', rating: 4 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
