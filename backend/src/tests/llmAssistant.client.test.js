/**
 * Tests unitarios del cliente del chatbot Data (contrato get-question).
 *
 * A diferencia de assistant.test.js (donde el client va mockeado), aquí se prueba
 * la lógica REAL de `fetchLlmQuestion` mockeando `global.fetch`:
 *   - 200 + Markdown          → devuelve el texto.
 *   - 200 + body vacío        → lanza (fallo).
 *   - 200 + body "ERROR: ..." → lanza (fallo). El chatbot Data señala así sus errores internos.
 *   - 500                     → lanza con .status.
 *   - timeout / error de red  → propaga el error de fetch.
 *
 * También se cubre `getLlmAssistantContract` (default retrocompatible) y la
 * construcción de la URL `GET {API_URL}/<pregunta>` con encoding.
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { fetchLlmQuestion, getLlmAssistantContract } from '../clients/llmAssistant.client.js';

/** Respuesta tipo `fetch` mínima para `fetchLlmQuestion` (usa ok/status/text). */
function fakeResponse({ ok = true, status = 200, body = '' }) {
  return { ok, status, text: async () => body };
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.restoreAllMocks();
  process.env.LLM_ASSISTANT_API_URL = 'http://localhost:5001';
  delete process.env.LLM_ASSISTANT_CONTRACT;
  delete process.env.LLM_ASSISTANT_TIMEOUT_MS;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('getLlmAssistantContract', () => {
  it('default es "post-family-plan" cuando no hay variable', () => {
    expect(getLlmAssistantContract()).toBe('post-family-plan');
  });

  it('respeta LLM_ASSISTANT_CONTRACT=get-question', () => {
    process.env.LLM_ASSISTANT_CONTRACT = 'get-question';
    expect(getLlmAssistantContract()).toBe('get-question');
  });
});

describe('fetchLlmQuestion (contrato get-question)', () => {
  it('200 + Markdown → devuelve el texto (trim) y construye GET /<pregunta> codificada', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(fakeResponse({ body: '  ## Plan en Bilbao\n\nOs propongo...  ' }));

    const result = await fetchLlmQuestion('Plan en Bilbao para niños');

    expect(result).toBe('## Plan en Bilbao\n\nOs propongo...');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('GET');
    expect(url).toBe(`http://localhost:5001/${encodeURIComponent('Plan en Bilbao para niños')}`);
  });

  it('200 + body vacío → lanza (fallo)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ body: '   ' }));

    await expect(fetchLlmQuestion('hola')).rejects.toThrow(/vac[ií]a/i);
  });

  it('200 + body que empieza por "ERROR:" → lanza (fallo)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      fakeResponse({ body: 'ERROR: no se pudo generar el plan' }),
    );

    await expect(fetchLlmQuestion('hola')).rejects.toThrow(/ERROR/);
  });

  it('500 → lanza error con .status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(fakeResponse({ ok: false, status: 500, body: 'boom' }));

    await expect(fetchLlmQuestion('hola')).rejects.toMatchObject({ status: 500 });
  });

  it('error de red / timeout → propaga el error de fetch', async () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    vi.spyOn(global, 'fetch').mockRejectedValue(abort);

    await expect(fetchLlmQuestion('hola')).rejects.toThrow(/aborted/i);
  });
});
