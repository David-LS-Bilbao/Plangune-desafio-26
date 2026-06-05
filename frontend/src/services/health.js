import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/** GET /api/health → true si la API responde { status: "ok" }. */
export async function checkHealth() {
  const { data } = await axios.get(`${API_BASE}/health`, { timeout: 4000 });
  return data?.status === "ok";
}
