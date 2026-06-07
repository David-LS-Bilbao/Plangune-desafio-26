/**
 * Tests de autenticación (/api/auth) y de los middlewares requireAuth/requireRole.
 *
 * Se mockea `user.repository.js` (capa Prisma) para no necesitar PostgreSQL. La lógica real
 * del service (bcrypt, validación, sanitización) y de los middlewares (JWT) se prueba de verdad.
 *
 * vi.mock se hoista al principio del módulo: se declara ANTES de importar createApp.
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import bcrypt from 'bcryptjs';

// JWT_SECRET de prueba (las utilidades JWT lo leen en cada llamada).
process.env.JWT_SECRET = 'test-secret-auth-minimum-strong-value-32';
process.env.JWT_EXPIRES_IN = '7d';

vi.mock('../repositories/user.repository.js', () => ({
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
}));

import request from 'supertest';

import { createApp } from '../app.js';
import { signToken, verifyToken } from '../utils/jwt.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { errorHandler } from '../middlewares/error.middleware.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
} from '../repositories/user.repository.js';

const app = createApp();

const DEMO_PASSWORD = 'Demo1234!';
let demoHash;

beforeEach(async () => {
  vi.clearAllMocks();
  demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
});

describe('POST /api/auth/register', () => {
  it('crea un usuario family (201), devuelve user sin password y fija cookie httpOnly', async () => {
    findUserByEmail.mockResolvedValue(null);
    createUser.mockImplementation(async ({ email, password, role }) => ({
      id: 101,
      email,
      password,
      role,
    }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nueva@demo.com', password: DEMO_PASSWORD, role: 'family' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ id: 101, email: 'nueva@demo.com', role: 'family' });
    expect(res.body.user).not.toHaveProperty('password');

    // La contraseña se guardó hasheada (nunca en claro).
    const createArg = createUser.mock.calls[0][0];
    expect(createArg.password).not.toBe(DEMO_PASSWORD);
    expect(await bcrypt.compare(DEMO_PASSWORD, createArg.password)).toBe(true);

    // Cookie de sesión httpOnly.
    const cookies = res.headers['set-cookie'] ?? [];
    expect(cookies.join(';')).toMatch(/token=/);
    expect(cookies.join(';')).toMatch(/HttpOnly/i);
  });

  it('rechaza email duplicado con 409', async () => {
    findUserByEmail.mockResolvedValue({ id: 1, email: 'dup@demo.com', password: demoHash, role: 'family' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@demo.com', password: DEMO_PASSWORD, role: 'family' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(createUser).not.toHaveBeenCalled();
  });

  it('rechaza rol admin por registro público con 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'hacker@demo.com', password: DEMO_PASSWORD, role: 'admin' });

    expect(res.status).toBe(422);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('rechaza password demasiado corta con 422', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'corta@demo.com', password: '123', role: 'family' });

    expect(res.status).toBe(422);
    expect(createUser).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/login', () => {
  it('login correcto (200): devuelve user sin password y fija cookie', async () => {
    findUserByEmail.mockResolvedValue({ id: 100, email: 'familia@demo.com', password: demoHash, role: 'family' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'familia@demo.com', password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 100, email: 'familia@demo.com', role: 'family' });
    expect(res.body.user).not.toHaveProperty('password');
    expect((res.headers['set-cookie'] ?? []).join(';')).toMatch(/token=/);
  });

  it('password incorrecta → 401 genérico', async () => {
    findUserByEmail.mockResolvedValue({ id: 100, email: 'familia@demo.com', password: demoHash, role: 'family' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'familia@demo.com', password: 'WrongPass99' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('email inexistente → 401 (mismo error, no revela si existe)', async () => {
    findUserByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@demo.com', password: DEMO_PASSWORD });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('sin token → 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('con token válido → 200 y user sin password', async () => {
    findUserById.mockResolvedValue({ id: 100, email: 'familia@demo.com', password: demoHash, role: 'family' });
    const token = signToken({ sub: 100, role: 'family' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 100, email: 'familia@demo.com', role: 'family' });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('token también aceptado vía cookie httpOnly', async () => {
    findUserById.mockResolvedValue({ id: 100, email: 'familia@demo.com', password: demoHash, role: 'family' });
    const token = signToken({ sub: 100, role: 'family' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(100);
  });
});

describe('POST /api/auth/logout', () => {
  it('borra la cookie de sesión (200)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    // clearCookie emite una cookie `token=` con expiración en el pasado.
    expect((res.headers['set-cookie'] ?? []).join(';')).toMatch(/token=/);
  });
});

describe('Middlewares requireAuth / requireRole', () => {
  // App mínima con una ruta protegida por rol admin.
  const guardApp = express();
  guardApp.get('/solo-admin', requireAuth, requireRole('admin'), (req, res) =>
    res.json({ ok: true, role: req.user.role }),
  );
  guardApp.use(errorHandler);

  it('sin token → 401', async () => {
    const res = await request(guardApp).get('/solo-admin');
    expect(res.status).toBe(401);
  });

  it('rol incorrecto (family) → 403', async () => {
    const token = signToken({ sub: 100, role: 'family' });
    const res = await request(guardApp).get('/solo-admin').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('rol correcto (admin) → 200', async () => {
    const token = signToken({ sub: 7, role: 'admin' });
    const res = await request(guardApp).get('/solo-admin').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, role: 'admin' });
  });
});

describe('JWT hardening', () => {
  it('rechaza JWT_SECRET débil o por defecto', () => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'change_me_in_local_env';

    expect(() => signToken({ sub: 1, role: 'admin' })).toThrow(/JWT_SECRET/i);

    process.env.JWT_SECRET = previousSecret;
  });

  it('firma/verifica con HS256 explícito', () => {
    const token = signToken({ sub: 100, role: 'family' });
    const payload = verifyToken(token);

    expect(payload).toMatchObject({ sub: 100, role: 'family' });
  });
});
