import React from "react";
import { useNavigate } from "react-router-dom";
import { usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

function PlansSearch() {
  const navigate = useNavigate();
  const filteredPlans = usePlansStore((state) => state.getFilteredPlans());
  const searchQuery = usePlansStore((state) => state.searchQuery);
  const setSearchQuery = usePlansStore((state) => state.setSearchQuery);
  const activeFilters = usePlansStore((state) => state.activeFilters);
  const toggleFilter = usePlansStore((state) => state.toggleFilter);

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
              <label className="chip">
                <input type="checkbox" name="age" value="bebe" className="sr-only" />
                <span className="chip-text">Bebé</span>
              </label>
              <label className="chip">
                <input type="checkbox" name="age" value="1-3" className="sr-only" />
                <span className="chip-text">1-3 años</span>
              </label>
              <label className="chip">
                <input type="checkbox" name="age" value="4-6" className="sr-only" />
                <span className="chip-text">4-6 años</span>
              </label>
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
        </div>

        {/* --- DYNAMIC PLANS LIST --- */}
        <div className="plans-list-dynamic" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--on-background)", marginBottom: "1rem" }}>
            Resultados de búsqueda
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
