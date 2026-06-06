import React from "react";
import { usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

function PlansList() {
  const getFilteredPlans = usePlansStore((state) => state.getFilteredPlans);
  const filteredPlans = getFilteredPlans();

  return (
    <main className="plans-user-main">
      <h1 className="plans-user-title">Planes para disfrutar en familia</h1>

      <div className="plans-user-list">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))
        ) : (
          <p className="plans-user-empty">No hay planes disponibles.</p>
        )}
      </div>
    </main>
  );
}

export default PlansList;
