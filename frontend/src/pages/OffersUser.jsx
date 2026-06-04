import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

function OffersUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Optional: We can use the offers from the business store to make it dynamic
  // For now we'll combine static design with dynamic offers if any.
  const dynamicOffers = useBusinessStore((state) => state.offers);

  return (
    <main className="plans-main-new" style={{ paddingBottom: "5rem" }}>
      <div className="plans-content">
        <h1 className="plans-title">{t('offersUser.title', 'Ofertas familiares cerca de ti')}</h1>

        <div className="offers-section">
          <div className="offers-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Dynamic Offers from Store */}
            {dynamicOffers.filter(o => o.status === 'active').map(offer => (
              <div key={offer.id} className="offer-card offer-card-primary" style={{ minWidth: '100%' }}>
                <div className="offer-card-header">
                  <span className="badge badge-primary">{t('offersUser.offer', 'OFERTA')}</span>
                  <span className="offer-date">
                    <span className="material-symbols-outlined text-sm">event</span>
                    {offer.meta || t('offersUser.limitedTime', 'Por tiempo limitado')}
                  </span>
                </div>
                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-subtitle">{offer.activity || offer.description}</p>
                <div className="offer-location">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {offer.location || 'Bilbao'}
                </div>
                <button
                  className="btn-primary-full"
                  type="button"
                  onClick={() => navigate(`/planes/${offer.id}`)}
                >
                  {t('offersUser.viewOffer', 'Ver oferta')}
                </button>
              </div>
            ))}

            {/* Static Card 1 */}
            <div className="offer-card offer-card-secondary" style={{ minWidth: '100%' }}>
              <div className="offer-card-header">
                <span className="badge badge-secondary">{t('offersUser.offer', 'OFERTA')}</span>
                <span className="offer-date">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {t('offersUser.until', 'Hasta 31 Oct')}
                </span>
              </div>
              <h3 className="offer-title">2x1 en menú infantil</h3>
              <p className="offer-subtitle">Comida Familiar de Domingo</p>
              <div className="offer-location">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Bilbao
              </div>
              <button
                className="btn-secondary-full"
                type="button"
                onClick={() => navigate("/planes/1")}
              >
                {t('offersUser.viewOffer', 'Ver oferta')}
              </button>
            </div>

            {/* Static Card 2 */}
            <div className="offer-card offer-card-primary" style={{ minWidth: '100%' }}>
              <div className="offer-card-header">
                <span className="badge badge-primary">{t('offersUser.workshop', 'TALLER')}</span>
                <span className="offer-date">
                  <span className="material-symbols-outlined text-sm">event</span>
                  {t('offersUser.onlyWednesdays', 'Solo miércoles')}
                </span>
              </div>
              <h3 className="offer-title">Taller gratuito</h3>
              <p className="offer-subtitle">Taller de Otoño Creativo</p>
              <div className="offer-location">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Getxo
              </div>
              <button
                className="btn-primary-full"
                type="button"
                onClick={() => navigate("/planes/2")}
              >
                {t('offersUser.viewOffer', 'Ver oferta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OffersUser;
