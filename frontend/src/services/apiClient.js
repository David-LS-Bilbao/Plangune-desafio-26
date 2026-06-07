import axios from "axios";

/**
 * Cliente HTTP único del frontend.
 *
 * REGLA DE CONTRATO (docs/contracts/frontend-backend-api-contract.md):
 * el frontend consume EXCLUSIVAMENTE la API Express bajo `/api`, vía `VITE_API_URL`.
 * Nunca llama directamente a Data, Flask, Ollama, DeepSeek ni a ninguna API externa:
 * Express es la fachada única que normaliza datos y gestiona los fallbacks.
 *
 * `VITE_API_URL` ya incluye el sufijo `/api` (ver frontend/.env.example).
 *
 * `withCredentials: true`: el navegador envía/recibe la cookie httpOnly de sesión (`token`)
 * en cada petición. El backend debe responder con CORS `credentials: true` y un origen
 * concreto (CLIENT_URL), nunca `*`.
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

export default apiClient;
