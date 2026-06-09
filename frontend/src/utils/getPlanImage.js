import { categoryImages, DEFAULT_CATEGORY } from "../data/categoryImages";

const CATEGORY_ALIASES = [
  { category: "museo", aliases: ["museo", "museos"] },
  { category: "parque-infantil", aliases: ["parque infantil", "juegos infantiles"] },
  { category: "parque-naturaleza", aliases: ["parque", "naturaleza", "zona verde"] },
  { category: "playa", aliases: ["playa", "mar", "costa"] },
  { category: "teatro-cine", aliases: ["teatro", "cine", "espectaculo", "espectáculo"] },
  { category: "actividad-interior", aliases: ["interior", "cubierto", "lluvia"] },
  { category: "actividad-exterior", aliases: ["exterior", "aire libre"] },
  {
    category: "gastronomia-familiar",
    aliases: ["gastronomia", "gastronomía", "restaurante", "cafeteria", "comida"],
  },
  { category: "mercado-feria", aliases: ["mercado", "feria"] },
  { category: "montana-ruta-facil", aliases: ["montaña", "montana", "ruta", "sendero"] },
  { category: "cultura-vasca", aliases: ["cultura vasca", "euskadi", "tradicion", "tradición"] },
  { category: "ciudades", aliases: ["bilbao", "donostia", "vitoria", "gasteiz", "ciudad"] },
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hashText(value) {
  const text = normalizeText(value);
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function getStableSeed(plan = {}) {
  if (plan.id !== undefined && plan.id !== null && plan.id !== "") {
    const numericId = Number(plan.id);
    return Number.isNaN(numericId) ? hashText(plan.id) : Math.abs(numericId);
  }

  return hashText(plan.title || plan.name || "");
}

function getCandidateText(plan = {}) {
  const tags = Array.isArray(plan.tags) ? plan.tags.join(" ") : "";

  return [
    plan.category,
    plan.categoria,
    plan.type,
    plan.tipo,
    plan.title,
    plan.name,
    plan.municipio,
    plan.location,
    plan.address,
    tags,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getPlanCategoryKey(plan = {}) {
  const candidateText = normalizeText(getCandidateText(plan));

  for (const { category, aliases } of CATEGORY_ALIASES) {
    if (aliases.some((alias) => candidateText.includes(normalizeText(alias)))) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}

export function getCategoryImage(plan = {}) {
  const categoryKey = getPlanCategoryKey(plan);
  const images = categoryImages[categoryKey]?.length
    ? categoryImages[categoryKey]
    : categoryImages[DEFAULT_CATEGORY];
  const seed = getStableSeed(plan);

  return images[seed % images.length];
}

export function getPlanImage(plan = {}) {
  return (
    plan.image ||
    plan.imagen_url ||
    plan.imageUrl ||
    getCategoryImage(plan) ||
    categoryImages[DEFAULT_CATEGORY][0]
  );
}

export default getPlanImage;
