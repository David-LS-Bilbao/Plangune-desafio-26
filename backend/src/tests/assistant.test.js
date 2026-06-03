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
  fetchLlmFamilyPlan: vi.fn(),
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
import { isLlmAssistantEnabled, fetchLlmFamilyPlan } from '../clients/llmAssistant.client.js';

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
  findEvents.mockResolvedValue(mockEvents);
  // Por defecto, LLM deshabilitado → fallback local.
  isLlmAssistantEnabled.mockReturnValue(false);
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
