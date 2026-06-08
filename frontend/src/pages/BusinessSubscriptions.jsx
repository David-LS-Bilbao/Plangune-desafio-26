import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

/**
 * Pantalla demostrativa de planes de pago del área negocio (NO procesa pagos reales).
 * Copy de Marketing: planes Landa (gratis) / Mendi (destacado) / Gailur.
 *
 * El plan gratuito se muestra como "Landa", pero internamente el store usa "Free" para el
 * tier gratuito (BusinessStrategy.jsx depende de `subscription === "Free"` para su gate de
 * upgrade). Por eso se mapea Free↔Landa solo en esta pantalla.
 */
const FREE_PLAN = "Landa";
const storeToDisplay = (sub) => (!sub || sub === "Free" ? FREE_PLAN : sub);
const displayToStore = (name) => (name === FREE_PLAN ? "Free" : name);

const PLANS = [
  {
    name: "Landa",
    price: "0€",
    period: "/mes",
    cta: "Obtener gratis",
    features: [
      "Ficha de negocio con foto",
      "Descripción básica (200 caracteres)",
      "Datos de contacto",
      "Directorio por provincia (Visualización en mapa)",
      "Recibir Valoraciones y Reseñas",
      "Crear ofertas promocionales",
    ],
  },
  {
    name: "Mendi",
    price: "39€",
    period: "/mes",
    annual: "374€/año (20% descuento)",
    cta: "Obtener Mendi",
    featured: true,
    features: [
      "Ficha mejorada con 6 fotos",
      "Descripción avanzada (500 caracteres)",
      "Destacado TOP RESULTADOS (2 veces/mes)",
      "Pin destacado en mapa",
      {
        text: "Acceso a ACTIVIDAD:",
        sub: ["Panel de negocio", "Plan de visibilidad", "1 filtro personalizado"],
      },
      "Newsletter (1 vez/mes)",
      "Menciones en nuestras RRSS",
      "Soporte 24h + reportes mensuales",
    ],
  },
  {
    name: "Gailur",
    price: "119€",
    period: "/mes",
    annual: "1.071€/año (25% descuento)",
    cta: "Obtener Gailur",
    features: [
      "Ficha premium con fotos ilimitadas",
      "Descripción avanzada (1000 caracteres)",
      "Destacado SIEMPRE EN TOP",
      "Pin permanente en mapa + Banner Hero",
      "Panel de negocio avanzado",
      "Plan de visibilidad avanzado",
      "1 filtro PATROCINADO GLOBAL (2 días/mes)",
      "Newsletter (2 vez/mes)",
      "Menciones prioritarias en nuestras RRSS",
      "Asesor dedicado",
      "Reportes semanales avanzados",
    ],
  },
];

function BusinessSubscriptions() {
  const navigate = useNavigate();
  const { subscription, setSubscription } = useBusinessStore();
  const [selectedPlan, setSelectedPlan] = useState(storeToDisplay(subscription));
  const [toastMsg, setToastMsg] = useState("");

  const handleSelectPlan = (planName) => {
    if (planName === selectedPlan) return;
    setSelectedPlan(planName);
    setSubscription(displayToStore(planName));
    setToastMsg(
      planName === FREE_PLAN
        ? "✓ Plan Landa activado. Solicitud registrada para demo."
        : `✓ Solicitud de ${planName} registrada para demo. Nuestro equipo contactará contigo.`,
    );
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleCancelPlan = () => {
    setSelectedPlan(FREE_PLAN);
    setSubscription("Free");
    setToastMsg("✓ Plan cancelado. Vuelves al plan Landa (gratis).");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <main className="business-subscriptions-main">
      {/* Toast */}
      {toastMsg && (
        <div className="subscription-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toastMsg}
        </div>
      )}

      <div className="biz-dashboard-header">
        <h1 className="page-title">Planes de pago</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>

      <div className="subscription-active-banner">
        <span className="material-symbols-outlined fill">workspace_premium</span>
        <span>Plan actual: <strong>{selectedPlan}</strong></span>
        {selectedPlan !== FREE_PLAN && (
          <button type="button" className="subscription-cancel-btn" onClick={handleCancelPlan}>
            Cancelar plan
          </button>
        )}
      </div>

      <p className="subscriptions-note">
        Pantalla demostrativa de propuesta comercial: la contratación no procesa pagos reales.
      </p>

      <section className="subscriptions-grid">
        {PLANS.map((plan) => {
          const isActive = selectedPlan === plan.name;
          return (
            <article
              key={plan.name}
              className={`subscription-card${plan.featured ? " featured" : ""}${isActive ? " active" : ""}`}
            >
              {isActive ? (
                <div className="subscription-active-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: "1rem" }}>check_circle</span>
                  Plan actual
                </div>
              ) : plan.featured ? (
                <div className="subscription-recommended-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: "1rem" }}>star</span>
                  Recomendado
                </div>
              ) : null}

              <div className="subscription-top">
                <span className="subscription-name">{plan.name}</span>
                <span className="subscription-price">
                  {plan.price}
                  <span className="subscription-period">{plan.period}</span>
                </span>
              </div>

              {plan.annual && <p className="subscription-annual">{plan.annual}</p>}

              <ul className="subscription-list">
                {plan.features.map((feature) => {
                  const item = typeof feature === "string" ? { text: feature } : feature;
                  return (
                    <li key={item.text}>
                      {item.text}
                      {item.sub && (
                        <ul className="subscription-sublist">
                          {item.sub.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              <button
                className="btn-primary-full"
                type="button"
                disabled={isActive}
                onClick={() => handleSelectPlan(plan.name)}
              >
                {isActive ? "Plan actual" : plan.cta}
              </button>
            </article>
          );
        })}
      </section>

      <section className="subscriptions-pitch">
        <h2 className="subscriptions-pitch__title">Haz que tu negocio sea El Plan.</h2>
        <p className="subscriptions-pitch__lead">
          El lugar donde las familias de Euskadi eligen estar
        </p>
        <p>
          Tienes un local increíble, instalaciones adaptadas y una gran oferta. Sin embargo,
          llega el fin de semana y sientes que tu inversión en publicidad se pierde en el
          ruido de las redes sociales. Las familias que buscan desesperadamente tiempo de
          calidad cerca de ti no te ven en el momento decisivo: cuando están decidiendo
          adónde ir.
        </p>
        <p>
          PlanGune es el canal de conexión definitivo. No vendemos likes; te conectamos con
          familias que están en tu zona, buscando exactamente lo que tú ofreces. Destacarás
          en su pantalla justo cuando filtren buscando un local "A cubierto", con
          "Cambiador" o "Gratis". Además, tus ofertas tendrán un escaparate brutal,
          impactando en tiempo real incluso a los miles de usuarios que navegan por la app
          sin estar registrados. Deja de disparar al aire. Tú pon la experiencia; nosotros
          llevamos a las familias hasta tu puerta.
        </p>
      </section>
    </main>
  );
}

export default BusinessSubscriptions;
