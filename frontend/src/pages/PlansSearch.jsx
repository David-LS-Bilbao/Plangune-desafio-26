import React from "react";
import { usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

const AGE_OPTIONS = ["Bebé", "1-3 años", "4-6 años", "7-9 años", "10-12 años"];
const FEATURE_OPTIONS = ["Carrito", "Cambiador", "Mascotas", "Interior", "Accesible", "Gratis"];

function PlansSearch() {
  const getFilteredPlans = usePlansStore((state) => state.getFilteredPlans);
  const filteredPlans = getFilteredPlans();
  const searchQuery = usePlansStore((state) => state.searchQuery);
  const setSearchQuery = usePlansStore((state) => state.setSearchQuery);
  const activeFilters = usePlansStore((state) => state.activeFilters);
  const toggleFilter = usePlansStore((state) => state.toggleFilter);
  const ageFilters = usePlansStore((state) => state.ageFilters);
  const toggleAgeFilter = usePlansStore((state) => state.toggleAgeFilter);

  const activeCount = ageFilters.length + activeFilters.length;

  return (
    <main className="plans-user-main">
      <h1 className="plans-user-title">Buscador de planes</h1>

      <div className="search-form">

        <div className="search-form__group">
          <label className="section-label">¿Qué buscas?</label>
          <div className="input-with-icon">
            <span className="material-symbols-outlined icon">search</span>
            <input
              type="text"
              placeholder="Museo, Bilbao, Getxo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="search-form__group">
          <span className="section-label">Edad de los peques</span>
          <div className="search-form__pills">
            {AGE_OPTIONS.map((age) => (
              <span
                key={age}
                className={`search-pill${ageFilters.includes(age) ? " active" : ""}`}
                onClick={() => toggleAgeFilter(age)}
              >
                {age}
              </span>
            ))}
          </div>
        </div>

        <div className="search-form__group">
          <span className="section-label">Sin sobresaltos</span>
          <div className="search-form__pills">
            {FEATURE_OPTIONS.map((filter) => (
              <span
                key={filter}
                className={`search-pill${activeFilters.includes(filter) ? " active" : ""}`}
                onClick={() => toggleFilter(filter)}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>

        {activeCount > 0 && (
          <div className="search-form__active-filters">
            <span className="search-form__active-label">Filtros activos:</span>
            {[...ageFilters, ...activeFilters].map((f) => (
              <span key={f} className="search-form__active-tag">{f}</span>
            ))}
          </div>
        )}


      </div>

      <h2 className="search-form__results-title">
        {filteredPlans.length > 0
          ? `${filteredPlans.length} plan${filteredPlans.length !== 1 ? "es" : ""} encontrado${filteredPlans.length !== 1 ? "s" : ""}`
          : "Sin resultados"}
      </h2>

      {filteredPlans.length > 0 ? (
        <div className="plans-user-list">
          {filteredPlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      ) : (
        <p className="plans-user-empty">No se encontraron planes con esa búsqueda.</p>
      )}

    </main>
  );
}

export default PlansSearch;
