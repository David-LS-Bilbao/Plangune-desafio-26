/**
 * Cliente HTTP del asistente LLM local (ai-service Flask).
 *
 * Encapsula la llamada a `POST {LLM_ASSISTANT_API_URL}/assistant/family-plan`.
 * Usa `fetch` nativo de Node (no axios) y `AbortController` para el timeout.
 * El frontend nunca llama a Flask: la fachada pública es Express.
 *
 * Variables de entorno (leídas en cada llamada, configurables/testeables):
 *   - LLM_ASSISTANT_ENABLED   ("true" activa el asistente LLM local)
 *   - LLM_ASSISTANT_API_URL   (por defecto http://localhost:5001)
 *   - LLM_ASSISTANT_TIMEOUT_MS (por defecto 8000)
 */

const DEFAULT_API_URL = 'http://localhost:5001';
const DEFAULT_TIMEOUT_MS = 8000;

/** ¿Está habilitado el asistente LLM local? */
export function isLlmAssistantEnabled() {
  return process.env.LLM_ASSISTANT_ENABLED === 'true';
}

/**
 * Llama a `POST {LLM_ASSISTANT_API_URL}/assistant/family-plan`.
 * Lanza un error controlado si la respuesta no es 2xx, si se agota el timeout
 * o si el shape mínimo no es válido.
 *
 * @param {{ message?: string, familyProfile?: object }} payload
 * @returns {Promise<{mode:string, source:string, assistantMessageMarkdown:string, recommendations:Array}>}
 */
export async function fetchLlmFamilyPlan(payload = {}) {
  const baseUrl = process.env.LLM_ASSISTANT_API_URL || DEFAULT_API_URL;
  const timeoutMs = Number(process.env.LLM_ASSISTANT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL('/assistant/family-plan', baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        message: payload.message,
        familyProfile: payload.familyProfile ?? {},
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Asistente LLM respondió ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    // Validación mínima: debe traer el texto markdown del asistente.
    if (!data || typeof data.assistantMessageMarkdown !== 'string') {
      throw new Error('Respuesta del asistente LLM inválida');
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

export default { isLlmAssistantEnabled, fetchLlmFamilyPlan };
