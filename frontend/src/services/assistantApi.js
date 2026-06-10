import apiClient from "./apiClient";

/**
 * Servicio del asistente familiar (GUNI). Solo habla con Express:
 *   POST /api/assistant/family-plan
 *
 * Express decide internamente LLM (data-chatbot / llm-local) o el fallback local;
 * el frontend NUNCA llama a Data/Flask/Ollama/DeepSeek directamente.
 *
 * Respuesta (ver contrato):
 *   - modo IA:       { mode:"ai", source, assistantMessageMarkdown, recommendations:[] }
 *   - fallback:      { mode:"fallback", message, recommendations:[...] }  (sin source)
 * `source`/`mode` son metadatos técnicos: la UI no los muestra en crudo.
 */
export async function sendFamilyPlan({ message, familyProfile = {} }) {
  const { data } = await apiClient.post(
    "/assistant/family-plan",
    { message, familyProfile },
    { timeout: 120000 } // 2 min: Ollama en CPU puede tardar en el arranque en frío
  );
  return data;
}

export default { sendFamilyPlan };
