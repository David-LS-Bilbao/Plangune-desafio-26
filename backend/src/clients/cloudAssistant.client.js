/**
 * Cliente cloud AISLADO para el fallback del asistente (GUNI).
 *
 * ⚠️ NO está cableado en assistant.service.js todavía (micro-paso siguiente). Este módulo solo
 * encapsula la llamada al proveedor cloud (Gemini por defecto). La decisión de `mode`/`source`
 * y el orden local → cloud → fallback corresponden a assistant.service.js, no a este cliente.
 *
 * Seguridad:
 *  - La API key vive SOLO en backend (env `CLOUD_ASSISTANT_API_KEY`). Nunca `VITE_*`, nunca al frontend.
 *  - La API key nunca se loguea ni se incluye en mensajes de error.
 *  - El familyProfile se minimiza (`sanitizeFamilyProfile`): solo edades, municipio y preferencias
 *    básicas. Nunca nombres, emails, userId ni datos identificativos de menores.
 *
 * Variables de entorno (leídas en cada llamada, configurables/testeables):
 *  - CLOUD_ASSISTANT_ENABLED    ("true" habilita el proveedor cloud)
 *  - CLOUD_ASSISTANT_PROVIDER   ("gemini" | futuro "deepseek"; por defecto "gemini")
 *  - CLOUD_ASSISTANT_API_KEY    (clave del proveedor; SOLO backend)
 *  - CLOUD_ASSISTANT_MODEL      (por defecto "gemini-2.0-flash-lite")
 *  - CLOUD_ASSISTANT_TIMEOUT_MS (por defecto 7000)
 */

const DEFAULT_PROVIDER = 'gemini';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_TIMEOUT_MS = 7000;

// Proveedores implementados. "deepseek" queda reservado para el futuro (selector preparado).
const SUPPORTED_PROVIDERS = new Set(['gemini']);

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// --- Política de reintentos (solo errores transitorios) ---------------------
// Gemini devuelve 503 intermitente bajo carga. Reintentamos como máximo MAX_RETRIES
// veces (MAX_RETRIES+1 intentos en total) con backoff corto, para no disparar la
// latencia total ni bloquear la demo. 429 (rate-limit/cuota) NO se reintenta: bajo
// saturación sostenida, reintentar multiplica las llamadas y empeora el rate-limit;
// es mejor caer al fallback local de inmediato. NUNCA se reintentan errores no
// recuperables: 429, 4xx, JSON inválido, respuesta sin texto, falta de key, provider
// no soportado, ni abort/timeout (ya se agotó el presupuesto de tiempo).
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_RETRIES = 2;
const BACKOFF_MS = [400, 900];
const RETRY_AFTER_CAP_MS = 1500;

/** ¿Está habilitado el proveedor cloud? */
export function isCloudAssistantEnabled() {
  return process.env.CLOUD_ASSISTANT_ENABLED === 'true';
}

/** Proveedor cloud configurado (por defecto "gemini"). */
export function getCloudAssistantProvider() {
  return process.env.CLOUD_ASSISTANT_PROVIDER || DEFAULT_PROVIDER;
}

function getApiKey() {
  return process.env.CLOUD_ASSISTANT_API_KEY || '';
}
function getModel() {
  return process.env.CLOUD_ASSISTANT_MODEL || DEFAULT_MODEL;
}
function getTimeoutMs() {
  return Number(process.env.CLOUD_ASSISTANT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
}

/** Crea un error controlado (con `.status` opcional). NUNCA incluye la API key. */
function cloudError(message, status) {
  const err = new Error(message);
  if (status !== undefined) err.status = status;
  err.isCloudAssistantError = true;
  return err;
}

/**
 * Minimiza el familyProfile a campos NO identificativos antes de enviarlo al proveedor cloud.
 * Permitidos: `childrenAges` (números 0–18), `municipality`, preferencias booleanas y `budget`.
 * Excluidos SIEMPRE: name, email, userId y cualquier dato identificativo (especialmente de menores).
 *
 * @param {object} [profile]
 * @returns {object} perfil minimizado seguro
 */
export function sanitizeFamilyProfile(profile = {}) {
  const p = profile && typeof profile === 'object' ? profile : {};
  const safe = {};

  if (Array.isArray(p.childrenAges)) {
    const ages = p.childrenAges
      .map((a) => Number(a))
      .filter((a) => Number.isFinite(a) && a >= 0 && a <= 18);
    if (ages.length > 0) safe.childrenAges = ages;
  }

  if (typeof p.municipality === 'string' && p.municipality.trim()) {
    safe.municipality = p.municipality.trim();
  }

  for (const key of [
    'strollerFriendly',
    'changingTable',
    'rainSuitable',
    'wheelchairAccessible',
    'petsAllowed',
  ]) {
    if (typeof p[key] === 'boolean') safe[key] = p[key];
  }

  if (typeof p.budget === 'number' && Number.isFinite(p.budget) && p.budget >= 0) {
    safe.budget = p.budget;
  }

  // Nota: name/email/userId u otros campos NO se copian deliberadamente.
  return safe;
}

/** Prompt breve, familiar y seguro (español, Euskadi). Solo usa datos ya minimizados. */
function buildPrompt(message, profile) {
  const lines = [
    'Eres GUNI, asistente para familias con bebés y niños pequeños en Euskadi.',
    'Responde en español y en Markdown breve.',
    'Prioriza planes tranquilos y accesibles (carrito, cambiador, interior si aplica).',
    'No inventes reservas, pagos ni disponibilidad. Si faltan datos, da orientación general.',
  ];

  const safeMessage = typeof message === 'string' ? message.trim() : '';
  if (safeMessage) lines.push(`Petición de la familia: ${safeMessage}`);

  const ctx = [];
  if (profile.childrenAges?.length) ctx.push(`edades de los peques: ${profile.childrenAges.join(', ')}`);
  if (profile.municipality) ctx.push(`municipio de referencia: ${profile.municipality}`);
  if (profile.strollerFriendly) ctx.push('necesita acceso con carrito');
  if (profile.changingTable) ctx.push('necesita cambiador');
  if (profile.rainSuitable) ctx.push('mejor plan a cubierto');
  if (profile.wheelchairAccessible) ctx.push('accesible con silla de ruedas');
  if (profile.petsAllowed) ctx.push('admite mascotas');
  if (typeof profile.budget === 'number') ctx.push(`presupuesto máximo aproximado: ${profile.budget} €`);
  if (ctx.length > 0) lines.push(`Contexto: ${ctx.join('; ')}.`);

  return lines.join('\n');
}

/** Extrae el texto de la respuesta de Gemini (`candidates[0].content.parts[].text`). */
function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('').trim();
}

/** Pausa breve para el backoff entre reintentos. */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lee `Retry-After` (en segundos) de la respuesta y lo pasa a ms, capado a
 * RETRY_AFTER_CAP_MS. Devuelve null si falta o no es un número razonable; no
 * intentamos parsear el formato fecha HTTP (en ese caso usamos el backoff por defecto).
 */
function parseRetryAfterMs(response) {
  const raw = response?.headers?.get?.('retry-after');
  if (!raw) return null;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.min(seconds * 1000, RETRY_AFTER_CAP_MS);
}

/**
 * Un intento contra Gemini (REST `:generateContent`) con fetch nativo + AbortController.
 * La API key viaja en cabecera `x-goog-api-key` (no en la URL) para no filtrarla en logs.
 *
 * Marca el error con `.retryable = true` SOLO si es transitorio (5xx 500/502/503/504,
 * o red tipo "fetch failed"); adjunta `.retryAfterMs` si el proveedor envía `Retry-After`.
 * El resto (429 rate-limit, otros 4xx, JSON inválido, sin texto, abort/timeout) se lanza
 * SIN `.retryable`. Ningún error incluye la API key ni el cuerpo de la respuesta.
 */
async function attemptGemini(url, body, { apiKey, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      // Abort/timeout: NO reintentable (ya se agotó el presupuesto de tiempo).
      if (err?.name === 'AbortError') {
        throw cloudError('Cloud assistant (gemini) agotó el tiempo de espera');
      }
      // Red/DNS transitoria (undici lanza TypeError "fetch failed"): reintentable.
      const netError = cloudError('Fallo de red al contactar el cloud assistant (gemini)');
      if (err instanceof TypeError || /fetch failed/i.test(err?.message || '')) {
        netError.retryable = true;
      }
      throw netError;
    }

    if (!response.ok) {
      // Status genérico; NO se incluye cuerpo/cabeceras (podrían traer detalles internos).
      const httpError = cloudError(
        `Cloud assistant (gemini) respondió ${response.status}`,
        response.status,
      );
      if (RETRYABLE_STATUS.has(response.status)) {
        httpError.retryable = true;
        const retryAfterMs = parseRetryAfterMs(response);
        if (retryAfterMs !== null) httpError.retryAfterMs = retryAfterMs;
      }
      throw httpError;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw cloudError('Respuesta JSON inválida del cloud assistant');
    }

    const text = extractGeminiText(data);
    if (typeof text !== 'string' || text.trim() === '') {
      throw cloudError('Respuesta del cloud assistant sin texto utilizable');
    }

    return { assistantMessageMarkdown: text, recommendations: [] };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Llama a Gemini con reintento corto ante fallos transitorios (503/429/5xx/red).
 * Intentos totales: MAX_RETRIES + 1. Backoff: BACKOFF_MS (o `Retry-After` capado).
 * Si se agotan los reintentos o el error NO es recuperable, relanza para que
 * `assistant.service.js` caiga al fallback local. Mantiene CLOUD_ASSISTANT_TIMEOUT_MS
 * por intento (los transitorios suelen fallar rápido, así que el total no se dispara).
 */
async function fetchGemini({ message, familyProfile }, { apiKey, model, timeoutMs }) {
  const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`;
  const prompt = buildPrompt(message, familyProfile);
  const body = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await attemptGemini(url, body, { apiKey, timeoutMs });
    } catch (err) {
      lastError = err;
      // Sin más intentos o error no recuperable → relanzar (el service hará fallback).
      if (attempt >= MAX_RETRIES || err?.retryable !== true) throw err;
      const waitMs = err.retryAfterMs ?? BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
      await sleep(waitMs);
    }
  }

  // Inalcanzable: el bucle siempre retorna o relanza. Defensivo por claridad.
  throw lastError;
}

/**
 * Pide un plan familiar al proveedor cloud configurado.
 *
 * @param {{ message?: string, familyProfile?: object }} [payload]
 * @returns {Promise<{ assistantMessageMarkdown: string, recommendations: [] }>}
 * @throws error controlado si: provider no soportado, falta API key, HTTP no-2xx (incluido 429),
 *         timeout/abort, JSON inválido o respuesta sin texto. El error nunca contiene la API key.
 */
export async function fetchCloudFamilyPlan(payload = {}) {
  const provider = getCloudAssistantProvider();
  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw cloudError(`Proveedor cloud no soportado: ${provider}`);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw cloudError('Falta CLOUD_ASSISTANT_API_KEY para el asistente cloud');
  }

  const safe = {
    message: typeof payload.message === 'string' ? payload.message : '',
    familyProfile: sanitizeFamilyProfile(payload.familyProfile),
  };
  const config = { apiKey, model: getModel(), timeoutMs: getTimeoutMs() };

  if (provider === 'gemini') {
    return fetchGemini(safe, config);
  }

  // Inalcanzable hoy (SUPPORTED_PROVIDERS solo tiene "gemini"); defensivo para el futuro.
  throw cloudError(`Proveedor cloud no implementado: ${provider}`);
}

export default {
  isCloudAssistantEnabled,
  getCloudAssistantProvider,
  fetchCloudFamilyPlan,
  sanitizeFamilyProfile,
};
