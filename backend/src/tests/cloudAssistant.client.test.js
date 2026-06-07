/**
 * Tests unitarios del cliente cloud aislado (Gemini) del asistente.
 *
 * Se prueba la lógica REAL mockeando `global.fetch` (nunca se llama a Gemini real).
 * Convención del repo: tests en backend/src/tests/ (ver llmAssistant.client.test.js).
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  isCloudAssistantEnabled,
  getCloudAssistantProvider,
  fetchCloudFamilyPlan,
} from '../clients/cloudAssistant.client.js';

/** Respuesta tipo `fetch` mínima (usa ok/status/json). */
function fakeResponse({ ok = true, status = 200, json } = {}) {
  return { ok, status, json: json ?? (async () => ({})) };
}

/** Respuesta 200 válida de Gemini con el texto indicado. */
function geminiOk(text) {
  return fakeResponse({
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  });
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.restoreAllMocks();
  // Estado base: habilitado + gemini + key de prueba (NO real).
  process.env.CLOUD_ASSISTANT_ENABLED = 'true';
  process.env.CLOUD_ASSISTANT_PROVIDER = 'gemini';
  process.env.CLOUD_ASSISTANT_API_KEY = 'test-key-no-real';
  process.env.CLOUD_ASSISTANT_MODEL = 'gemini-2.0-flash-lite';
  process.env.CLOUD_ASSISTANT_TIMEOUT_MS = '7000';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('isCloudAssistantEnabled / getCloudAssistantProvider', () => {
  it('enabled solo si CLOUD_ASSISTANT_ENABLED === "true"', () => {
    expect(isCloudAssistantEnabled()).toBe(true);
    process.env.CLOUD_ASSISTANT_ENABLED = 'false';
    expect(isCloudAssistantEnabled()).toBe(false);
    delete process.env.CLOUD_ASSISTANT_ENABLED;
    expect(isCloudAssistantEnabled()).toBe(false);
  });

  it('provider por defecto es "gemini"', () => {
    delete process.env.CLOUD_ASSISTANT_PROVIDER;
    expect(getCloudAssistantProvider()).toBe('gemini');
  });
});

describe('fetchCloudFamilyPlan · Gemini', () => {
  it('200 válido → assistantMessageMarkdown y recommendations []; key solo en cabecera', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(geminiOk('## Plan\nUn museo cubierto en Bilbao.'));

    const res = await fetchCloudFamilyPlan({
      message: 'plan cubierto',
      familyProfile: { childrenAges: [1], municipality: 'Bilbao' },
    });

    expect(typeof res.assistantMessageMarkdown).toBe('string');
    expect(res.assistantMessageMarkdown).toContain('Un museo cubierto');
    expect(res.recommendations).toEqual([]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).not.toContain('test-key-no-real'); // la key NO va en la URL
    expect(options.headers['x-goog-api-key']).toBe('test-key-no-real');
  });

  it('falta API key → error controlado (sin exponer la clave) y sin llamar a fetch', async () => {
    delete process.env.CLOUD_ASSISTANT_API_KEY;
    const fetchMock = vi.spyOn(global, 'fetch');

    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/CLOUD_ASSISTANT_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('HTTP 429 → lanza error con status 429 (para que el service caiga a fallback)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 429 }));
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toMatchObject({ status: 429 });
  });

  it('HTTP 500 → lanza error con status 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 500 }));
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toMatchObject({ status: 500 });
  });

  it('timeout / abort → lanza error', async () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    vi.spyOn(global, 'fetch').mockRejectedValue(abort);
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/aborted/i);
  });

  it('JSON válido pero sin texto → lanza error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ json: async () => ({ candidates: [] }) }));
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/sin texto/i);
  });

  it('JSON inválido (json() lanza) → lanza error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('bad json');
      },
    });
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/JSON/i);
  });

  it('provider desconocido → error controlado y sin llamar a fetch', async () => {
    process.env.CLOUD_ASSISTANT_PROVIDER = 'mistral';
    const fetchMock = vi.spyOn(global, 'fetch');
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/no soportado/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('el payload enviado NO incluye datos identificativos (email/userId/name)', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(geminiOk('ok'));

    await fetchCloudFamilyPlan({
      message: 'plan en familia',
      familyProfile: {
        childrenAges: [2],
        municipality: 'Bilbao',
        strollerFriendly: true,
        name: 'Familia Agirre',
        email: 'familia@example.com',
        userId: 'usr_123',
      },
    });

    const body = fetchMock.mock.calls[0][1].body;
    expect(body).not.toContain('Familia Agirre');
    expect(body).not.toContain('familia@example.com');
    expect(body).not.toContain('usr_123');
    // Sí incluye los campos permitidos (no identificativos).
    expect(body).toContain('Bilbao');
  });

  it('la API key nunca aparece en el mensaje de error (HTTP 500)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 500 }));
    try {
      await fetchCloudFamilyPlan({ message: 'x' });
      throw new Error('no debería resolver');
    } catch (err) {
      expect(err.message).not.toContain('test-key-no-real');
    }
  });
});
