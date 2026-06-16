import React from "react";
import PlanCard from "../components/common/PlanCard";
import { useFavorites } from "../context/FavoritesContext";

function Favorites() {
  const { favoritePlans, loading, error, refresh } = useFavorites();

  return (
    <main className="plans-user-main">
      <h1 className="plans-user-title">Tus planes favoritos</h1>

      {loading && (
        <div className="planner-state">
          <div className="planner-spinner" role="status" aria-label="Cargando favoritos" />
          <p className="planner-state__text">Cargando tus favoritos...</p>
        </div>
      )}

      {!loading && error && (
        <div className="planner-state">
          <span className="material-symbols-outlined planner-state__icon">cloud_off</span>
          <p className="planner-state__text">
            No hemos podido cargar tus favoritos. Inténtalo de nuevo.
          </p>
          <button type="button" className="planner-retry" onClick={refresh}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        favoritePlans.length > 0 ? (
          <div className="plans-user-list">
            {favoritePlans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        ) : (
          <div className="favorites-empty">
            <span className="material-symbols-outlined favorites-empty__icon">bookmark</span>
            <p>No has guardado ningún plan aún.</p>
            <p>Explora los planes y pulsa el corazón para guardarlos aquí.</p>
          </div>
        )
      )}
    </main>
  );
}

export default Favorites;
