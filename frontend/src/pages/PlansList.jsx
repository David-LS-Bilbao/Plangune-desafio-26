import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

function PlansList() {
  const navigate = useNavigate();
  const filteredPlans = usePlansStore((state) => state.getFilteredPlans());
  const searchQuery = usePlansStore((state) => state.searchQuery);
  const setSearchQuery = usePlansStore((state) => state.setSearchQuery);

  return (
    <main className="plans-main-new" style={{ paddingBottom: "5rem" }}>
      {/* Hero Section / Form */}
      <div className="plans-content">
        <h1 className="plans-title">Planes fáciles con peques en Euskadi</h1>

        {/* --- DYNAMIC PLANS LIST --- */}
        <div className="plans-list-dynamic" style={{ marginTop: "1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--on-background)", marginBottom: "1rem" }}>
            Todos los planes recomendados
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <p style={{ color: "var(--on-surface-variant)" }}>
                No hay planes disponibles.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="plans-hero-image" style={{ display: "none" }}>
        {/* Hiding hero image to prioritize the list of results on this view */}
      </div>
    </main>
  );
}

export default PlansList;
