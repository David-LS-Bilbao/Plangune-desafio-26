import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

const AGE_OPTIONS = ["Bebé", "1-3 años", "4-6 años"];

function PlansSearch() {
  const navigate = useNavigate();
  const filteredPlans = usePlansStore((state) => state.getFilteredPlans());
  const searchQuery = usePlansStore((state) => state.searchQuery);
  const setSearchQuery = usePlansStore((state) => state.setSearchQuery);
  const activeFilters = usePlansStore((state) => state.activeFilters);
  const toggleFilter = usePlansStore((state) => state.toggleFilter);
  const ageFilters = usePlansStore((state) => state.ageFilters);
  const toggleAgeFilter = usePlansStore((state) => state.toggleAgeFilter);

  return (
    <main className="plans-main-new" style={{ paddingBottom: "5rem" }}>
      <div className="plans-content">
        <h1 className="plans-title">Buscador de planes</h1>

        {/* Search Form */}
        <div className="search-form-new">
          {/* Location */}
          <div className="form-group">
            <label className="form-label">¿Qué buscas?</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon" data-icon="search">
                search
              </span>
              <input
                type="text"
                placeholder="Museo, Bilbao, Getxo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Age Filter */}
          <div className="form-group">
            <label className="form-label">Edad de los peques</label>
            <div className="chips-container">
              {AGE_OPTIONS.map((age) => {
                const isActive = ageFilters.includes(age);
                return (
                  <button
                    key={age}
                    type="button"
                    onClick={() => toggleAgeFilter(age)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "9999px",
                      border: `1px solid ${isActive ? "var(--primary-container)" : "var(--outline-variant)"}`,
                      backgroundColor: isActive ? "var(--primary-container)" : "transparent",
                      color: isActive ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Features Filter */}
          <div className="form-group">
            <label className="form-label">Sin sobresaltos:</label>
            <div className="checkboxes-container">
              {['Carrito', 'Cambiador', 'Interior', 'Tranquilo', 'Gratis'].map((filter) => (
                <label className="checkbox-label" key={filter}>
                  <input 
                    type="checkbox" 
                    className="custom-checkbox" 
                    checked={activeFilters.includes(filter)}
                    onChange={() => toggleFilter(filter)}
                  />
                  <span className="checkbox-text">{filter}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active filter summary */}
          {(ageFilters.length > 0 || activeFilters.length > 0) && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 500 }}>
                Filtros activos:
              </span>
              {[...ageFilters, ...activeFilters].map((f) => (
                <span key={f} style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: "999px",
                  background: "var(--primary-container)",
                  color: "var(--on-primary-container)",
                }}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* --- DYNAMIC PLANS LIST --- */}
        <div className="plans-list-dynamic" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--on-background)", marginBottom: "1rem" }}>
            {filteredPlans.length > 0
              ? `${filteredPlans.length} plan${filteredPlans.length !== 1 ? "es" : ""} encontrado${filteredPlans.length !== 1 ? "s" : ""}`
              : "Resultados de búsqueda"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <p style={{ color: "var(--on-surface-variant)" }}>
                No se encontraron planes con esa búsqueda.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlansSearch;
