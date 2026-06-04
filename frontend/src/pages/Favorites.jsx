import React from "react";
import { useTranslation } from "react-i18next";
import { useUserStore, usePlansStore } from "../store";
import PlanCard from "../components/common/PlanCard";

function Favorites() {
  const { t } = useTranslation();
  const favoritesIds = useUserStore((state) => state.favorites);
  const allPlans = usePlansStore((state) => state.allPlans);
  const favoritePlans = allPlans.filter((plan) =>
    favoritesIds.includes(plan.id),
  );

  return (
    <main className="favorites-main">
      <section className="page-header">
        <div>
          <p className="page-tag">{t('nav.favorites', 'Guardados')}</p>
          <h1 className="page-title">{t('favorites.title', 'Tus planes favoritos')}</h1>
        </div>
      </section>

      <section className="favorites-list">
        {favoritePlans.length > 0 ? (
          <div className="favorites-grid">
            {favoritePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="favorites-empty">
            <p>{t('favorites.empty', 'No has guardado ningún plan aún.')}</p>
            <p>
              {t('favorites.explore', 'Visita la pantalla de explorar para encontrar actividades familiares que te encanten.')}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default Favorites;
