/**
 * Cliente HTTP del asistente LLM local.
 *
 * Soporta dos contratos (seleccionables con LLM_ASSISTANT_CONTRACT):
 *   - "post-family-plan": ai-service Flask, `POST {API_URL}/assistant/family-plan`.
 *   - "get-question":     chatbot Data dockerizado, `GET {API_URL}/<pregunta>`.
 *
 * Usa `fetch` nativo de Node (no axios) y `AbortController` para el timeout.
 * El frontend nunca llama a Flask/Data: la fachada pública es Express.
 *
 * Variables de entorno (leídas en cada llamada, configurables/testeables):
 *   - LLM_ASSISTANT_ENABLED    ("true" activa el asistente LLM)
 *   - LLM_ASSISTANT_API_URL    (por defecto http://localhost:5001)
 *   - LLM_ASSISTANT_TIMEOUT_MS (por defecto 8000)
 *   - LLM_ASSISTANT_CONTRACT   ("post-family-plan" | "get-question")
 */

const DEFAULT_API_URL = 'http://localhost:5001';
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CONTRACT = 'post-family-plan';

/** ¿Está habilitado el asistente LLM local? */
export function isLlmAssistantEnabled() {
  return process.env.LLM_ASSISTANT_ENABLED === 'true';
}

/**
 * Contrato del asistente LLM a usar. Default retrocompatible con el ai-service.
 * @returns {'post-family-plan'|'get-question'|string}
 */
export function getLlmAssistantContract() {
  return process.env.LLM_ASSISTANT_CONTRACT || DEFAULT_CONTRACT;
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

/**
 * Llama al chatbot Data dockerizado: `GET {LLM_ASSISTANT_API_URL}/<pregunta>`.
 *
 * El chatbot Data puede responder HTTP 200 con un cuerpo que empieza por `ERROR:`
 * cuando falla internamente; eso se trata como fallo (lanza), igual que un body
 * vacío, un status no-2xx o un timeout. El servicio lo captura y usa fallback local.
 *
 * @param {string} question pregunta en lenguaje natural ya compuesta
 * @returns {Promise<string>} texto Markdown no vacío devuelto por el chatbot
 */
export async function fetchLlmQuestion(question) {
  const base = (process.env.LLM_ASSISTANT_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
  const timeoutMs = Number(process.env.LLM_ASSISTANT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
  const url = `${base}/${encodeURIComponent(question)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'text/markdown, text/plain, */*' },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Chatbot Data respondió ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const text = (await response.text()).trim();

    if (text === '') {
      throw new Error('Respuesta vacía del chatbot Data');
    }
    // El chatbot Data señala fallos internos con un 200 cuyo cuerpo empieza por "ERROR:".
    if (text.startsWith('ERROR:')) {
      throw new Error('El chatbot Data devolvió ERROR');
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}

export default {
  isLlmAssistantEnabled,
  getLlmAssistantContract,
  fetchLlmFamilyPlan,
  fetchLlmQuestion,
};
