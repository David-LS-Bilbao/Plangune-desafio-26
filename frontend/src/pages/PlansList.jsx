import React, { useEffect, useState } from "react";
import PlanCard from "../components/common/PlanCard";
import HealthBadge from "../components/common/HealthBadge";
import { fetchEvents, eventToPlan } from "../services/events";

function PlansList() {
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    let active = true;
    fetchEvents()
      .then((events) => {
        if (!active) return;
        setPlans(events.map(eventToPlan));
        setStatus("done");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="plans-main-new" style={{ paddingBottom: "5rem" }}>
      {/* Hero Section / Form */}
      <div className="plans-content">
        <h1 className="plans-title">Planes fáciles con peques en Euskadi</h1>
        <HealthBadge />

        {/* --- DYNAMIC PLANS LIST (datos reales: GET /api/events) --- */}
        <div className="plans-list-dynamic" style={{ marginTop: "1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--on-background)", marginBottom: "1rem" }}>
            Todos los planes recomendados
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {status === "loading" && (
              <p style={{ color: "var(--on-surface-variant)" }}>Cargando planes…</p>
            )}
            {status === "error" && (
              <p role="alert" style={{ color: "#b3261e", fontWeight: 500 }}>
                No se pudieron cargar los planes. ¿Está el backend en marcha?
              </p>
            )}
            {status === "done" && plans.length === 0 && (
              <p style={{ color: "var(--on-surface-variant)" }}>
                No hay planes disponibles.
              </p>
            )}
            {status === "done" &&
              plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
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
