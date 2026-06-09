import apiClient from "./apiClient";

/**
 * Servicio de autenticación. Solo habla con Express:
 *   POST /api/auth/register  → crea cuenta (family/business) e inicia sesión
 *   POST /api/auth/login      → inicia sesión
 *   GET  /api/auth/me         → usuario de la sesión actual (vía cookie httpOnly)
 *   POST /api/auth/logout     → cierra sesión (borra la cookie)
 *
 * El token NO se maneja en JavaScript: viaja en una cookie httpOnly que el navegador
 * envía automáticamente (apiClient usa withCredentials). Aquí solo circula el `user`.
 */

/**
 * Inicia sesión con email + contraseña.
 * @returns {Promise<object>} usuario { id, email, role }
 */
export async function login(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data.user;
}

/**
 * Registra una cuenta nueva (role 'family' o 'business') e inicia sesión.
 * @param {{ email: string, password: string, role: string }} payload
 * @returns {Promise<object>} usuario { id, email, role }
 */
export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data.user;
}

/**
 * Recupera el usuario de la sesión actual (si la cookie es válida).
 * @returns {Promise<object>} usuario { id, email, role }; lanza si no hay sesión (401).
 */
export async function fetchMe() {
  const { data } = await apiClient.get("/auth/me");
  return data.user;
}

/** Cierra la sesión en el backend (borra la cookie). Idempotente. */
export async function logout() {
  await apiClient.post("/auth/logout");
}

/**
 * Inicia sesión o registra mediante un token de Google.
 * @param {string} credential El JWT devuelto por Google
 * @param {string} [role] El rol si es registro
 * @returns {Promise<object>} usuario { id, email, role }
 */
export async function loginWithGoogle(credential, role) {
  const { data } = await apiClient.post("/auth/google", { credential, role });
  return data.user;
}

export default { login, register, loginWithGoogle, fetchMe, logout };
