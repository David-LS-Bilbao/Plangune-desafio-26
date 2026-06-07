import { getRecommendations } from './recommendation.service.js';
import {
  isLlmAssistantEnabled,
  getLlmAssistantContract,
  fetchLlmFamilyPlan,
  fetchLlmQuestion,
} from '../clients/llmAssistant.client.js';
import {
  isCloudAssistantEnabled,
  getCloudAssistantProvider,
  fetchCloudFamilyPlan,
} from '../clients/cloudAssistant.client.js';

/**
 * Asistente de plan familiar (POST /api/assistant/family-plan).
 *
 * Fuente PRINCIPAL (si `LLM_ASSISTANT_ENABLED=true`), según `LLM_ASSISTANT_CONTRACT`:
 *   - "post-family-plan": ai-service Flask (POST), devuelve `assistantMessageMarkdown`.
 *   - "get-question":     chatbot Data dockerizado (GET /<pregunta>), devuelve Markdown.
 * Fuente FALLBACK: el recomendador reglado local (eventos reales de Prisma), sin IA.
 *
 * El frontend SIEMPRE consume este Express; nunca llama a Flask/Data directamente.
 */

const LOCAL_FALLBACK_MESSAGE =
  'El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.';

/**
 * Compone una pregunta en lenguaje natural (español) para el chatbot Data a partir
 * del mensaje del usuario y un contexto familiar breve. Mantiene el texto simple.
 *
 * @param {{ message?: string, context?: object }} params
 * @returns {string} pregunta lista para `GET /<pregunta>`
 */
export function buildQuestion({ message, context = {} } = {}) {
  const parts = [];

  if (typeof message === 'string' && message.trim()) {
    parts.push(message.trim());
  }

  const ages = Array.isArray(context.childrenAges) ? context.childrenAges : [];
  const contextParts = [];
  if (ages.length > 0) {
    contextParts.push(`Familia con niños de ${ages.join(', ')} años`);
  }
  if (context.municipality) {
    contextParts.push(`Municipio: ${context.municipality}`);
  }
  if (contextParts.length > 0) {
    parts.push(`${contextParts.join('. ')}.`);
  }

  return parts.join(' ').trim();
}

/**
 * Fallback local (sin IA): reutiliza el recomendador reglado.
 * Shape estable e histórico: { mode:'fallback', message, recommendations }.
 */
export async function getFamilyPlanFallback(context = {}) {
  return {
    mode: 'fallback',
    message: LOCAL_FALLBACK_MESSAGE,
    recommendations: await getRecommendations(context),
  };
}

/**
 * Plan vía LLM local/Data/Ollama. Lanza si el proveedor falla (lo captura `getFamilyPlan`
 * para pasar al siguiente nivel de la cascada).
 */
async function getLocalLlmPlan({ message, context }) {
  if (getLlmAssistantContract() === 'get-question') {
    const question = buildQuestion({ message, context });
    const assistantMessageMarkdown = await fetchLlmQuestion(question);
    return { mode: 'ai', source: 'data-chatbot', assistantMessageMarkdown, recommendations: [] };
  }

  // Contrato por defecto "post-family-plan": ai-service Flask.
  const llm = await fetchLlmFamilyPlan({ message, familyProfile: context });
  return {
    mode: 'ai',
    source: 'llm-local',
    assistantMessageMarkdown: llm.assistantMessageMarkdown,
    recommendations: Array.isArray(llm.recommendations) ? llm.recommendations : [],
  };
}

/**
 * Plan vía proveedor cloud (Gemini por defecto). Lanza si falla (429/500/timeout/sin key/
 * inválido) para que `getFamilyPlan` caiga al fallback local. `source: "cloud-<provider>"`.
 */
async function getCloudPlan({ message, context }) {
  const cloud = await fetchCloudFamilyPlan({ message, familyProfile: context });
  return {
    mode: 'ai',
    source: `cloud-${getCloudAssistantProvider()}`,
    assistantMessageMarkdown: cloud.assistantMessageMarkdown,
    recommendations: Array.isArray(cloud.recommendations) ? cloud.recommendations : [],
  };
}

/**
 * Orquesta el asistente con degradación en cascada:
 *   1) LLM local/Data/Ollama   (si LLM_ASSISTANT_ENABLED).
 *   2) Cloud (Gemini)          (si CLOUD_ASSISTANT_ENABLED).
 *   3) Fallback local reglado  (siempre disponible).
 *
 * Los errores de cada proveedor se capturan y NUNCA se propagan al cliente (sin filtrar
 * detalles internos ni API keys). El contrato público de la respuesta no cambia.
 *
 * @param {{ message?: string, context?: object }} [params]
 * @returns {Promise<object>} plan del asistente
 */
export async function getFamilyPlan({ message, context = {} } = {}) {
  // 1) LLM local/Data/Ollama
  if (isLlmAssistantEnabled()) {
    try {
      return await getLocalLlmPlan({ message, context });
    } catch {
      // local deshabilitado de facto/timeout/5xx/inválido → probar cloud o fallback
    }
  }

  // 2) Cloud opcional (solo si está habilitado)
  if (isCloudAssistantEnabled()) {
    try {
      return await getCloudPlan({ message, context });
    } catch {
      // cloud sin key/429/500/timeout/inválido → fallback local reglado
    }
  }

  // 3) Fallback local reglado (sin IA)
  return getFamilyPlanFallback(context);
}
