import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PlanCard from "../components/common/PlanCard";
import { fetchEvents } from "../services/eventsApi";
import { eventsToPlans } from "../mappers/eventMapper";

function PlansList() {
  const { t } = useTranslation();
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
      <h1 className="plans-user-title">{t("plans_list.title")}</h1>

      {loading && (
        <div className="planner-state">
          <div className="planner-spinner" role="status" aria-label={t("plans_list.loading")} />
          <p className="planner-state__text">{t("plans_list.loading")}</p>
        </div>
      )}

      {!loading && error && (
        <div className="planner-state">
          <span className="material-symbols-outlined planner-state__icon">cloud_off</span>
          <p className="planner-state__text">{t("plans_list.error")}</p>
          <button type="button" className="planner-retry" onClick={load}>
            {t("plans_list.retry")}
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
            <p className="planner-state__text">{t("plans_list.empty")}</p>
          </div>
        )
      )}
    </main>
  );
}

export default PlansList;
