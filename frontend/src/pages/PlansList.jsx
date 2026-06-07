import React, { useEffect, useState } from "react";
import PlanCard from "../components/common/PlanCard";
import { fetchEvents } from "../services/eventsApi";
import { eventsToPlans } from "../mappers/eventMapper";

function PlansList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetchEvents()
      .then((events) => setPlans(eventsToPlans(events)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="plans-user-main">
      <h1 className="plans-user-title">Planes para disfrutar en familia</h1>

      {loading && (
        <div className="planner-state">
          <div className="planner-spinner" role="status" aria-label="Cargando planes" />
          <p className="planner-state__text">Cargando planes...</p>
        </div>
      )}

      {!loading && error && (
        <div className="planner-state">
          <span className="material-symbols-outlined planner-state__icon">cloud_off</span>
          <p className="planner-state__text">
            No hemos podido cargar los planes. Revisa tu conexión e inténtalo de nuevo.
          </p>
          <button type="button" className="planner-retry" onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        plans.length > 0 ? (
          <div className="plans-user-list">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        ) : (
          <div className="planner-state">
            <span className="material-symbols-outlined planner-state__icon">event_busy</span>
            <p className="planner-state__text">
              Aún no hay planes disponibles. Vuelve pronto para descubrir nuevas actividades.
            </p>
          </div>
        )
      )}
    </main>
  );
}

export default PlansList;
