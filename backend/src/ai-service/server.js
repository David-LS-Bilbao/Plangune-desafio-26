/**
 * Servidor puente entre el backend Express (DESAFIO-26) y Ollama.
 *
 * El backend llama a POST /assistant/family-plan con { message, familyProfile }
 * y este servicio lo traduce a la API de Ollama (/api/generate) y devuelve
 * el formato que Express espera: { mode, source, assistantMessageMarkdown, recommendations }.
 *
 * Arrancar: node server.js   (puerto 5001 por defecto)
 * Requisito: Ollama corriendo en localhost:11434 con el modelo configurado descargado.
 */

import http from 'http';
import https from 'https';

const PORT = process.env.AI_SERVICE_PORT || 5001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/** Construye el prompt para Ollama a partir del payload del asistente. */
function buildPrompt(message, familyProfile = {}) {
  const { children = [], municipality = '', budget = '' } = familyProfile;

  const childrenDesc = children.length > 0
    ? children.map(c => `- Niño/a de ${c.age ?? '?'} años`).join('\n')
    : '- Sin datos de hijos específicos';

  return `Eres un asistente de planes familiares en Euskadi (País Vasco).
Responde siempre en español y en formato Markdown breve (máximo 200 palabras).
Sugiere actividades o planes concretos para familias con niños pequeños.

Perfil familiar:
${childrenDesc}
Municipio: ${municipality || 'Cualquier zona de Euskadi'}
Presupuesto aproximado: ${budget ? budget + '€' : 'Flexible'}

Pregunta del usuario: ${message || '¿Qué podemos hacer hoy en familia?'}

Responde con 2-3 sugerencias concretas y accionables.`;
}

/** Llama a la API de Ollama y devuelve el texto generado. */
async function callOllama(prompt) {
  const body = JSON.stringify({
    model: MODEL,
    prompt,
    stream: false,
    options: { temperature: 0.7, num_predict: 250 },
  });

  return new Promise((resolve, reject) => {
    const url = new URL('/api/generate', OLLAMA_URL);
    const lib = url.protocol === 'https:' ? https : http;

    const req = lib.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.response) {
            return reject(new Error('Ollama no devolvió respuesta'));
          }
          resolve(parsed.response.trim());
        } catch {
          reject(new Error('Respuesta de Ollama no es JSON válido'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(90000, () => { req.destroy(); reject(new Error('Timeout Ollama')); });
    req.write(body);
    req.end();
  });
}

/** Servidor HTTP mínimo (sin dependencias externas). */
const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', model: MODEL, ollama: OLLAMA_URL }));
  }

  // Endpoint principal
  if (req.method === 'POST' && req.url === '/assistant/family-plan') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const prompt = buildPrompt(payload.message, payload.familyProfile);
        const markdown = await callOllama(prompt);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          mode: 'ai',
          source: `ollama-${MODEL}`,
          assistantMessageMarkdown: markdown,
          recommendations: [],
        }));
      } catch (err) {
        console.error('[ai-service] Error:', err.message);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[ai-service] Escuchando en http://localhost:${PORT}`);
  console.log(`[ai-service] Usando Ollama en ${OLLAMA_URL} con modelo "${MODEL}"`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ai-service] ❌ El puerto ${PORT} ya está en uso.`);
    console.error(`[ai-service] Libéralo con: kill $(lsof -ti:${PORT})`);
    process.exit(1);
  }
  throw err;
});
