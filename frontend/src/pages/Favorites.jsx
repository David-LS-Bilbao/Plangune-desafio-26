import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useUserStore, usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

function Favorites() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const favoritesIds = useUserStore((state) => state.favorites);
  const allPlans = usePlansStore((state) => state.allPlans);
  const favoritePlans = allPlans.filter((plan) => favoritesIds.includes(plan.id));

  if (!user) {
    return (
      <main className="plans-user-main">
        <div className="favorites-empty">
          <span className="material-symbols-outlined favorites-empty__icon">lock</span>
          <p>Inicia sesión para guardar tus planes favoritos.</p>
          <button className="btn-primary" type="button" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="plans-user-main">
      <h1 className="plans-user-title">Tus planes favoritos</h1>

      {favoritePlans.length > 0 ? (
        <div className="plans-user-list">
          {favoritePlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      ) : (
        <div className="favorites-empty">
          <span className="material-symbols-outlined favorites-empty__icon">bookmark</span>
          <p>No has guardado ningún plan aún.</p>
          <p>Visita la pantalla de explorar para encontrar actividades familiares que te encanten.</p>
        </div>
      )}
    </main>
  );
}

export default Favorites;
