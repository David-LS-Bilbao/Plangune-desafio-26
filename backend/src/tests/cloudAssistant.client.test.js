/**
 * Tests unitarios del cliente cloud aislado (Gemini) del asistente.
 *
 * Se prueba la lógica REAL mockeando `global.fetch` (nunca se llama a Gemini real).
 * Convención del repo: tests en backend/src/tests/ (ver llmAssistant.client.test.js).
 *
 * Incluye la política de reintento corto ante errores transitorios (503/429/5xx/red):
 * con fake timers se avanzan los backoffs sin esperas reales. Los errores NO recuperables
 * (4xx salvo 429, JSON inválido, sin texto, abort/timeout, falta de key) NO se reintentan.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  isCloudAssistantEnabled,
  getCloudAssistantProvider,
  fetchCloudFamilyPlan,
} from '../clients/cloudAssistant.client.js';

/** Respuesta tipo `fetch` mínima (usa ok/status/json; headers opcional para Retry-After). */
function fakeResponse({ ok = true, status = 200, json, headers } = {}) {
  return { ok, status, headers, json: json ?? (async () => ({})) };
}

/** Respuesta 200 válida de Gemini con el texto indicado. */
function geminiOk(text) {
  return fakeResponse({
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  });
}

/** Cabeceras tipo `Headers` con un único `Retry-After` (en segundos). */
function retryAfterHeaders(seconds) {
  return {
    get: (name) => (String(name).toLowerCase() === 'retry-after' ? String(seconds) : null),
  };
}

/** Bajo fake timers, corre los backoffs pendientes hasta que la promesa se asienta. */
function drainRetries() {
  return vi.runAllTimersAsync();
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.restoreAllMocks();
  vi.useFakeTimers();
  // Estado base: habilitado + gemini + key de prueba (NO real).
  process.env.CLOUD_ASSISTANT_ENABLED = 'true';
  process.env.CLOUD_ASSISTANT_PROVIDER = 'gemini';
  process.env.CLOUD_ASSISTANT_API_KEY = 'test-key-no-real';
  process.env.CLOUD_ASSISTANT_MODEL = 'gemini-2.0-flash-lite';
  process.env.CLOUD_ASSISTANT_TIMEOUT_MS = '7000';
});

afterEach(() => {
  vi.useRealTimers();
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

describe('fetchCloudFamilyPlan · Gemini · camino feliz y errores NO recuperables', () => {
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

  it('falta API key → error controlado (sin exponer la clave) y sin llamar a fetch ni reintentar', async () => {
    delete process.env.CLOUD_ASSISTANT_API_KEY;
    const fetchMock = vi.spyOn(global, 'fetch');

    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/CLOUD_ASSISTANT_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('provider desconocido → error controlado y sin llamar a fetch', async () => {
    process.env.CLOUD_ASSISTANT_PROVIDER = 'mistral';
    const fetchMock = vi.spyOn(global, 'fetch');
    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/no soportado/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('HTTP 401 → NO reintenta y lanza error con status 401', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 401 }));

    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1); // no recuperable → un único intento
  });

  it('HTTP 404 → NO reintenta y lanza error con status 404', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 404 }));

    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toMatchObject({ status: 404 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('HTTP 429 (rate-limit) → NO reintenta, fetch una sola vez, lanza status 429 y no filtra la key', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 429 }));

    const err = await fetchCloudFamilyPlan({ message: 'x' }).catch((e) => e);

    expect(err.status).toBe(429);
    expect(err.message).not.toContain('test-key-no-real');
    expect(fetchMock).toHaveBeenCalledTimes(1); // 429 NO se reintenta (cuota/rate-limit sostenido)
  });

  it('timeout / abort → lanza error controlado, NO reintenta y no filtra la key', async () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    const fetchMock = vi.spyOn(global, 'fetch').mockRejectedValue(abort);

    const captured = fetchCloudFamilyPlan({ message: 'x' }).catch((e) => e);
    const err = await captured;

    expect(err).toBeInstanceOf(Error);
    expect(err.message).toMatch(/tiempo de espera/i);
    expect(err.message).not.toContain('test-key-no-real');
    expect(fetchMock).toHaveBeenCalledTimes(1); // abort NO se reintenta (presupuesto agotado)
  });

  it('JSON válido pero sin texto → lanza error y NO reintenta', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(fakeResponse({ json: async () => ({ candidates: [] }) }));

    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/sin texto/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('JSON inválido (json() lanza) → lanza error y NO reintenta', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('bad json');
      },
    });

    await expect(fetchCloudFamilyPlan({ message: 'x' })).rejects.toThrow(/JSON/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
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
});

describe('fetchCloudFamilyPlan · Gemini · reintento ante errores transitorios', () => {
  it('1) primer intento 503, segundo 200 → devuelve assistantMessageMarkdown', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(fakeResponse({ ok: false, status: 503 }))
      .mockResolvedValueOnce(geminiOk('## Plan\nrecuperado tras 503'));

    const p = fetchCloudFamilyPlan({ message: 'x' });
    await drainRetries();
    const res = await p;

    expect(res.assistantMessageMarkdown).toContain('recuperado tras 503');
    expect(res.recommendations).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('2) tres intentos 503 → agota reintentos y lanza (status 503) para que el service caiga a fallback', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 503 }));

    const captured = fetchCloudFamilyPlan({ message: 'x' }).catch((e) => e);
    await drainRetries();
    const err = await captured;

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(3); // 1 intento + 2 reintentos (MAX_RETRIES)
  });

  it('HTTP 500 en los 3 intentos → agota reintentos y lanza status 500', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 500 }));

    const captured = fetchCloudFamilyPlan({ message: 'x' }).catch((e) => e);
    await drainRetries();
    const err = await captured;

    expect(err.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('error de red transitorio ("fetch failed") y luego 200 → reintenta y devuelve markdown', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(geminiOk('## Plan\nok tras error de red'));

    const p = fetchCloudFamilyPlan({ message: 'x' });
    await drainRetries();
    const res = await p;

    expect(res.assistantMessageMarkdown).toContain('ok tras error de red');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('503 con Retry-After=1 → respeta el header (capado ≤1500ms) y reintenta una vez', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(fakeResponse({ ok: false, status: 503, headers: retryAfterHeaders(1) }))
      .mockResolvedValueOnce(geminiOk('## Plan\nok tras Retry-After'));

    const p = fetchCloudFamilyPlan({ message: 'x' });
    await drainRetries();
    const res = await p;

    expect(res.assistantMessageMarkdown).toContain('ok tras Retry-After');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('fetchCloudFamilyPlan · Gemini · seguridad de la API key', () => {
  it('la API key nunca aparece en el mensaje de error, ni tras agotar reintentos (500×3)', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 500 }));

    const captured = fetchCloudFamilyPlan({ message: 'x' }).catch((e) => e);
    await drainRetries();
    const err = await captured;

    expect(err.message).not.toContain('test-key-no-real');
    expect(err.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
