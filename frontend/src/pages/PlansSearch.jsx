import React, { useEffect, useMemo, useRef, useState } from "react";
import PlanCard from "../components/common/PlanCard";
import RecommendedPlans from "../components/recommendations/RecommendedPlans";
import GuniFabLauncher from "../components/assistant/GuniFabLauncher";
import { fetchEvents } from "../services/eventsApi";
import { eventsToPlans } from "../mappers/eventMapper";

const AGE_OPTIONS = ["Bebé", "1-3 años", "4-6 años", "7-9 años", "10-12 años"];

// Mapeo de cada rango de edad a una edad de referencia (el contrato usa `edad`:
// el evento es apto si edad_minima <= edad).
const AGE_TO_NUMBER = {
  "Bebé": 0,
  "1-3 años": 3,
  "4-6 años": 6,
  "7-9 años": 9,
  "10-12 años": 12,
};

const TERRITORIOS = ["Bizkaia", "Gipuzkoa", "Araba"];

// Pills de servicios familiares. Cada uno mapea a un filtro real del backend,
// salvo los marcados como `clientOnly`/`prepared` (sin equivalente en /api/events aún).
const FEATURE_OPTIONS = [
  { label: "Carrito", param: "es_carrito" },
  { label: "Cambiador", param: "es_cambiador" },
  { label: "Silla de ruedas", param: "es_silla_ruedas" },
  { label: "Mascota", param: "es_mascotas" },
  { label: "Interior", param: "es_interior" },
  { label: "Gratis", clientOnly: true }, // se filtra en cliente por precio
  { label: "Tranquilo", prepared: true }, // sin dato en backend todavía (no rompe UI)
];

const FEATURE_BY_LABEL = Object.fromEntries(FEATURE_OPTIONS.map((f) => [f.label, f]));

// Mapeo de filtro de evento (snake_case) -> query param de /api/recommendations (camelCase).
const REC_PARAM = {
  es_carrito: "strollerFriendly",
  es_cambiador: "changingTable",
  es_silla_ruedas: "wheelchairAccessible",
  es_mascotas: "petsAllowed",
  es_interior: "rainSuitable",
};

/** ¿El precio del plan indica gratuito? */
function isFreePlan(plan) {
  const p = String(plan.price ?? "").trim().toLowerCase();
  return p === "gratis" || p === "0" || p === "0 €" || p === "0€";
}

function PlansSearch() {
  const [query, setQuery] = useState("");
  const [territorio, setTerritorio] = useState("");
  const [ageFilters, setAgeFilters] = useState([]);
  const [activeFeatures, setActiveFeatures] = useState([]);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Evita condiciones de carrera: solo aplica la respuesta de la última petición.
  const requestIdRef = useRef(0);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  /** Construye los query params reales para GET /api/events. */
  const buildFilters = () => {
    const filters = {};
    if (query.trim()) filters.municipio = query.trim();
    if (territorio) filters.territorio = territorio;

    activeFeatures.forEach((label) => {
      const feature = FEATURE_BY_LABEL[label];
      if (feature?.param) filters[feature.param] = true;
    });

    const ages = ageFilters.map((a) => AGE_TO_NUMBER[a]).filter((n) => n != null);
    if (ages.length > 0) filters.edad = Math.max(...ages);

    // Preparado para cuando la UI añada selección de fechas:
    // if (fechaDesde) filters.fecha_desde = fechaDesde;
    // if (fechaHasta) filters.fecha_hasta = fechaHasta;
    return filters;
  };

  // Contexto para /api/recommendations (camelCase), derivado de los mismos filtros.
  const recommendationContext = useMemo(() => {
    const ctx = { limit: 3 };
    if (query.trim()) ctx.municipality = query.trim();
    const ages = ageFilters.map((a) => AGE_TO_NUMBER[a]).filter((n) => n != null);
    if (ages.length > 0) ctx.childrenAges = ages;
    activeFeatures.forEach((label) => {
      const feature = FEATURE_BY_LABEL[label];
      if (feature?.param && REC_PARAM[feature.param]) ctx[REC_PARAM[feature.param]] = true;
      if (label === "Gratis") ctx.budget = 0;
    });
    return ctx;
  }, [query, ageFilters, activeFeatures]);

  // Búsqueda contra la API con debounce al cambiar cualquier filtro.
  useEffect(() => {
    const id = ++requestIdRef.current;
    setLoading(true);
    setError(false);

    const timer = setTimeout(() => {
      fetchEvents(buildFilters())
        .then((events) => {
          if (id !== requestIdRef.current) return; // respuesta obsoleta
          let result = eventsToPlans(events);
          if (activeFeatures.includes("Gratis")) result = result.filter(isFreePlan);
          setPlans(result);
        })
        .catch(() => {
          if (id === requestIdRef.current) setError(true);
        })
        .finally(() => {
          if (id === requestIdRef.current) setLoading(false);
        });
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, territorio, ageFilters, activeFeatures]);

  const activeCount = ageFilters.length + activeFeatures.length + (territorio ? 1 : 0);

  return (
    <main className="plans-user-main">
      <h1 className="plans-user-title">Buscador de planes</h1>

      <div className="search-form">
        <div className="search-form__group">
          <label className="section-label">Municipio</label>
          <div className="input-with-icon">
            <span className="material-symbols-outlined icon">search</span>
            <input
              type="text"
              placeholder="Bilbao, Getxo, Donostia..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="search-form__group">
          <label className="section-label" htmlFor="territorio">Territorio</label>
          <select
            id="territorio"
            className="input-with-icon"
            value={territorio}
            onChange={(e) => setTerritorio(e.target.value)}
          >
            <option value="">Todos</option>
            {TERRITORIOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="search-form__group">
          <span className="section-label">Edad de los peques</span>
          <div className="search-form__pills">
            {AGE_OPTIONS.map((age) => (
              <span
                key={age}
                className={`search-pill${ageFilters.includes(age) ? " active" : ""}`}
                onClick={() => toggle(ageFilters, setAgeFilters, age)}
              >
                {age}
              </span>
            ))}
          </div>
        </div>

        <div className="search-form__group">
          <span className="section-label">Sin sobresaltos</span>
          <div className="search-form__pills">
            {FEATURE_OPTIONS.map((feature) => (
              <span
                key={feature.label}
                className={`search-pill${activeFeatures.includes(feature.label) ? " active" : ""}`}
                onClick={() => toggle(activeFeatures, setActiveFeatures, feature.label)}
              >
                {feature.label}
              </span>
            ))}
          </div>
        </div>

        {activeCount > 0 && (
          <div className="search-form__active-filters">
            <span className="search-form__active-label">Filtros activos:</span>
            {territorio && <span className="search-form__active-tag">{territorio}</span>}
            {[...ageFilters, ...activeFeatures].map((f) => (
              <span key={f} className="search-form__active-tag">{f}</span>
            ))}
          </div>
        )}
      </div>

      <GuniFabLauncher />

      <RecommendedPlans context={recommendationContext} />

      {loading && (
        <div className="planner-state">
          <div className="planner-spinner" role="status" aria-label="Buscando planes" />
          <p className="planner-state__text">Buscando planes...</p>
        </div>
      )}

      {!loading && error && (
        <div className="planner-state">
          <span className="material-symbols-outlined planner-state__icon">cloud_off</span>
          <p className="planner-state__text">No hemos podido buscar planes. Inténtalo de nuevo.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <h2 className="search-form__results-title">
            {plans.length > 0
              ? plans.length === 1
                ? "¡Encontramos el plan perfecto para tu familia!"
                : `¡Encontramos ${plans.length} planes perfectos para tu familia!`
              : "No encontramos nada... ¡pero hay muchos planes esperándote! Cambia los filtros."}
          </h2>

          {plans.length > 0 && (
            <div className="plans-user-list">
              {plans.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default PlansSearch;
