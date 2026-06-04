/**
 * Tests de POST /api/assistant/family-plan.
 *
 * Se mockean (sin Flask, Ollama ni PostgreSQL reales):
 *   - llmAssistant.client.js   → controla si el LLM está habilitado y su respuesta.
 *   - dataRecommender.client.js → Data deshabilitado (el fallback usa el recomendador local).
 *   - event.repository.js      → datos del recomendador local (mockEvents).
 *
 * Por defecto el LLM está DESHABILITADO → el assistant usa el fallback local.
 *
 * Los vi.mock se declaran ANTES de importar createApp (Vitest los hoista).
 */
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../clients/llmAssistant.client.js', () => ({
  isLlmAssistantEnabled: vi.fn(),
  getLlmAssistantContract: vi.fn(),
  fetchLlmFamilyPlan: vi.fn(),
  fetchLlmQuestion: vi.fn(),
}));

vi.mock('../clients/dataRecommender.client.js', () => ({
  isDataRecommenderEnabled: vi.fn(() => false),
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
import {
  isLlmAssistantEnabled,
  getLlmAssistantContract,
  fetchLlmFamilyPlan,
  fetchLlmQuestion,
} from '../clients/llmAssistant.client.js';

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
  findEvents.mockResolvedValue(mockEvents);
  // Por defecto, LLM deshabilitado → fallback local.
  isLlmAssistantEnabled.mockReturnValue(false);
  // Default retrocompatible: contrato ai-service (POST). Los tests de get-question lo sobreescriben.
  getLlmAssistantContract.mockReturnValue('post-family-plan');
});

// ---------------------------------------------------------------------------
// Fallback local (LLM deshabilitado) — comportamiento histórico
// ---------------------------------------------------------------------------

describe('POST /api/assistant/family-plan · fallback local (LLM deshabilitado)', () => {
  it('responde 200 con mode "fallback"', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'Plan a cubierto para un peque de 3 años', childrenAges: [3], rainSuitable: true });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
  });

  it('devuelve recommendations como array (≤3)', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ childrenAges: [2], municipality: 'Bilbao', budget: 40 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    expect(res.body.recommendations.length).toBeLessThanOrEqual(3);
  });

  it('acepta familyProfile anidado y responde 200', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'Plan en Bilbao', familyProfile: { childrenAges: [3], municipality: 'Bilbao' } });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  it('acepta body vacío y responde 200', async () => {
    const res = await request(app).post('/api/assistant/family-plan').send({});

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
  });

  it('rechaza message de más de 500 caracteres con 422', async () => {
    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'x'.repeat(501) });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
  });

  it('no llama al LLM cuando está deshabilitado', async () => {
    await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });
    expect(fetchLlmFamilyPlan).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Asistente LLM local (habilitado)
// ---------------------------------------------------------------------------

describe('POST /api/assistant/family-plan · LLM local habilitado', () => {
  const llmOk = {
    mode: 'ai',
    source: 'llm-local',
    assistantMessageMarkdown: '## 🎭 Plan recomendado\n\nTe propongo...',
    recommendations: [],
  };

  it('LLM OK → mode "ai" y source "llm-local"', async () => {
    isLlmAssistantEnabled.mockReturnValue(true);
    fetchLlmFamilyPlan.mockResolvedValue(llmOk);

    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'Plan gratis para hoy en Bilbao', familyProfile: { childrenAges: [3], municipality: 'Bilbao' } });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('ai');
    expect(res.body.source).toBe('llm-local');
    expect(typeof res.body.assistantMessageMarkdown).toBe('string');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
    // No se usó el fallback local cuando el LLM respondió bien.
    expect(findEvents).not.toHaveBeenCalled();
  });

  it('LLM timeout/error → fallback local', async () => {
    isLlmAssistantEnabled.mockReturnValue(true);
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    fetchLlmFamilyPlan.mockRejectedValue(abort);

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  it('LLM 500 → fallback local', async () => {
    isLlmAssistantEnabled.mockReturnValue(true);
    const err = new Error('Asistente LLM respondió 500');
    err.status = 500;
    fetchLlmFamilyPlan.mockRejectedValue(err);

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
  });

  it('LLM respuesta inválida → fallback local', async () => {
    isLlmAssistantEnabled.mockReturnValue(true);
    // El client lanza si el shape es inválido; aquí simulamos ese rechazo.
    fetchLlmFamilyPlan.mockRejectedValue(new Error('Respuesta del asistente LLM inválida'));

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Contrato "get-question" — chatbot Data dockerizado (GET /<pregunta>)
//
// El client (fetchLlmQuestion) va mockeado: resuelve Markdown en el caso OK y
// rechaza en los casos de fallo (timeout, body vacío, "ERROR:", 500). La
// detección REAL de body vacío / "ERROR:" se cubre en llmAssistant.client.test.js.
// ---------------------------------------------------------------------------

describe('POST /api/assistant/family-plan · contrato get-question (chatbot Data)', () => {
  beforeEach(() => {
    isLlmAssistantEnabled.mockReturnValue(true);
    getLlmAssistantContract.mockReturnValue('get-question');
  });

  it('OK → mode "ai", source "data-chatbot", Markdown y recommendations []', async () => {
    fetchLlmQuestion.mockResolvedValue('## Plan en Bilbao\n\nOs propongo...');

    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'Plan gratis para hoy en Bilbao', familyProfile: { childrenAges: [3], municipality: 'Bilbao' } });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('ai');
    expect(res.body.source).toBe('data-chatbot');
    expect(typeof res.body.assistantMessageMarkdown).toBe('string');
    expect(res.body.assistantMessageMarkdown.length).toBeGreaterThan(0);
    // En modo AI las recomendaciones vienen vacías (el chatbot devuelve Markdown).
    expect(res.body.recommendations).toEqual([]);
    // No se usó el contrato POST ni el fallback local.
    expect(fetchLlmFamilyPlan).not.toHaveBeenCalled();
    expect(findEvents).not.toHaveBeenCalled();
  });

  it('timeout/error de fetch → fallback local', async () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    fetchLlmQuestion.mockRejectedValue(abort);

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  it('respuesta vacía (client rechaza) → fallback local', async () => {
    fetchLlmQuestion.mockRejectedValue(new Error('Respuesta vacía del chatbot Data'));

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
  });

  it('body que empieza por "ERROR:" (client rechaza) → fallback local', async () => {
    fetchLlmQuestion.mockRejectedValue(new Error('El chatbot Data devolvió ERROR'));

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  it('500 del chatbot Data → fallback local', async () => {
    const err = new Error('Chatbot Data respondió 500');
    err.status = 500;
    fetchLlmQuestion.mockRejectedValue(err);

    const res = await request(app).post('/api/assistant/family-plan').send({ message: 'hola' });

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('fallback');
  });

  it('mantiene el contrato público: 200 y no usa el contrato POST', async () => {
    fetchLlmQuestion.mockResolvedValue('## Plan\n\nContenido');

    const res = await request(app)
      .post('/api/assistant/family-plan')
      .send({ message: 'Plan en Getxo', familyProfile: { childrenAges: [2, 5], municipality: 'Getxo' } });

    expect(res.status).toBe(200);
    expect(fetchLlmFamilyPlan).not.toHaveBeenCalled();
    expect(fetchLlmQuestion).toHaveBeenCalledTimes(1);
    // La pregunta enviada al chatbot incluye mensaje + contexto familiar.
    const question = fetchLlmQuestion.mock.calls[0][0];
    expect(question).toContain('Plan en Getxo');
    expect(question).toContain('2, 5');
    expect(question).toContain('Getxo');
  });
});
