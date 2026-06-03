import { getRecommendations } from './recommendation.service.js';
import { isLlmAssistantEnabled, fetchLlmFamilyPlan } from '../clients/llmAssistant.client.js';

/**
 * Asistente de plan familiar (POST /api/assistant/family-plan).
 *
 * Fuente PRINCIPAL (si `LLM_ASSISTANT_ENABLED=true`): el asistente LLM local (ai-service Flask),
 * que devuelve `assistantMessageMarkdown` generado con Ollama.
 * Fuente FALLBACK: el recomendador reglado local (eventos reales de Prisma), sin IA.
 *
 * El frontend SIEMPRE consume este Express; nunca llama a Flask directamente.
 */

const LOCAL_FALLBACK_MESSAGE =
  'El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.';

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
      const llm = await fetchLlmFamilyPlan({ message, familyProfile: context });
      return {
        mode: 'ai',
        source: 'llm-local',
        assistantMessageMarkdown: llm.assistantMessageMarkdown,
        recommendations: Array.isArray(llm.recommendations) ? llm.recommendations : [],
      };
    } catch {
      // Error de red, timeout, 5xx o respuesta inválida → fallback local.
    }
  }

  return getFamilyPlanFallback(context);
}
