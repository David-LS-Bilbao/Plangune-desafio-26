import axios from "axios";
import placeholder from "../assets/hero-image.webp";

// Fachada única: el frontend consume SOLO Express bajo /api.
// Contrato: docs/contracts/frontend-backend-api-contract.md
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Demo: los events sembrados no traen `imagen_url`. Generamos una imagen variada y
// ESTABLE por evento (seed = id) para que cada card se vea distinta sin parpadear.
// Si en el futuro el backend rellena `imagen_url`, se usa la real automáticamente.
function imageForEvent(event) {
  if (event.imagen_url) return event.imagen_url;
  if (event.id == null) return placeholder;
  return `https://picsum.photos/seed/desafio26-${event.id}/600/400`;
}

/** GET /api/events → array de eventos (shape real `events`, snake_case). */
export async function fetchEvents(params = {}) {
  const { data } = await axios.get(`${API_BASE}/events`, { params });
  return Array.isArray(data) ? data : [];
}

/** GET /api/events/:id → un evento. */
export async function fetchEventById(id) {
  const { data } = await axios.get(`${API_BASE}/events/${id}`);
  return data;
}

/**
 * Mapea un `event` real (snake_case) al shape de "plan" que esperan
 * PlanCard / PlanDetail, sin tener que tocar esos componentes.
 */
export function eventToPlan(event = {}) {
  const edadMin = event.edad_minima ?? 0;

  const tags = [];
  if (event.es_carrito) tags.push("Apto Carrito");
  if (event.es_cambiador) tags.push("Cambiador");
  if (event.es_interior) tags.push("Interior");

  return {
    id: event.id,
    title: event.title || "Plan",
    image: imageForEvent(event),
    location: [event.municipio, event.territorio].filter(Boolean).join(", "),
    category: event.categoria || "Plan",
    price: event.price || "Consultar",
    rating: null, // los events reales no traen rating todavía
    isIdeal: false,
    description: event.description || "Sin descripción disponible.",
    ageRange: edadMin > 0 ? `${edadMin}+ años` : "Todas las edades",
    tags,
  };
}
