/**
 * Cliente HTTP único del frontend (Refactorizado de Axios a Fetch).
 *
 * REGLA DE CONTRATO (docs/contracts/frontend-backend-api-contract.md):
 * el frontend consume EXCLUSIVAMENTE la API Express bajo `/api`, vía `VITE_API_URL`.
 * Nunca llama directamente a Data, Flask, Ollama, DeepSeek ni a ninguna API externa.
 */
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class FetchError extends Error {
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}

async function fetchWrapper(method, url, options = {}) {
  let fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;
  
  if (options.params) {
    // Exclude undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(options.params).filter(([_, v]) => v != null)
    );
    const searchParams = new URLSearchParams(cleanParams);
    if (searchParams.toString()) {
      fullUrl += `?${searchParams.toString()}`;
    }
  }

  const isFormData = options.data instanceof FormData;

  const fetchOptions = {
    method,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
    credentials: "include", // Equivalent to withCredentials: true
  };

  if (options.data) {
    fetchOptions.body = isFormData ? options.data : JSON.stringify(options.data);
  }

  // Handle timeout roughly like axios does
  const timeoutMs = options.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId);

    // Try to parse JSON data
    let data = null;
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const errorResponse = {
        status: response.status,
        data: data || {},
      };
      throw new FetchError(`Request failed with status ${response.status}`, errorResponse);
    }

    return { data, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const apiClient = {
  get: (url, config) => fetchWrapper("GET", url, config),
  post: (url, data, config = {}) => fetchWrapper("POST", url, { ...config, data }),
  put: (url, data, config = {}) => fetchWrapper("PUT", url, { ...config, data }),
  patch: (url, data, config = {}) => fetchWrapper("PATCH", url, { ...config, data }),
  delete: (url, config) => fetchWrapper("DELETE", url, config),
};

export default apiClient;
