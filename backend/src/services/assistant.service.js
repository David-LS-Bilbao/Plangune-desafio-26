import { getRecommendations } from './recommendation.service.js';
import {
  isLlmAssistantEnabled,
  getLlmAssistantContract,
  fetchLlmFamilyPlan,
  fetchLlmQuestion,
} from '../clients/llmAssistant.client.js';

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
 * Orquesta el asistente: LLM local primero (si habilitado), fallback local si falla.
 *
 * @param {{ message?: string, context?: object }} [params]
 * @returns {Promise<object>} plan del asistente
 */
export async function getFamilyPlan({ message, context = {} } = {}) {
  if (isLlmAssistantEnabled()) {
    try {
      if (getLlmAssistantContract() === 'get-question') {
        const question = buildQuestion({ message, context });
        const assistantMessageMarkdown = await fetchLlmQuestion(question);
        return {
          mode: 'ai',
          source: 'data-chatbot',
          assistantMessageMarkdown,
          recommendations: [],
        };
      }

      // Contrato por defecto "post-family-plan": ai-service Flask.
      const llm = await fetchLlmFamilyPlan({ message, familyProfile: context });
      return {
        mode: 'ai',
        source: 'llm-local',
        assistantMessageMarkdown: llm.assistantMessageMarkdown,
        recommendations: Array.isArray(llm.recommendations) ? llm.recommendations : [],
      };
    } catch {
      // Error de red, timeout, 5xx, body vacío, "ERROR:" o respuesta inválida → fallback local.
    }
  }

  return getFamilyPlanFallback(context);
}
