import { getRecommendations } from './recommendation.service.js';

/**
 * Asistente de plan familiar (MVP).
 * De momento NO usa IA (ni Python ni Ollama): devuelve un fallback controlado
 * reutilizando el recomendador reglado.
 */
export function getFamilyPlanFallback(context = {}) {
  return {
    mode: 'fallback',
    message:
      'El asistente IA aún no está disponible. Te mostramos recomendaciones basadas en filtros.',
    recommendations: getRecommendations(context),
  };
}
