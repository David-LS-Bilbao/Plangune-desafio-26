import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore } from '../store';

function ManageOffers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const { offers, updateOffer, deleteOffer } = useBusinessStore();

  const TABS = [
    { key: 'all',     label: `Todas (${offers.length})` },
    { key: 'active',  label: `Activas (${offers.filter(o => o.status === 'active').length})` },
    { key: 'pending', label: `Pendientes (${offers.filter(o => o.status === 'pending').length})` },
  ];

  const filtered = activeTab === 'all' ? offers : offers.filter(o => o.status === activeTab);

  return (
    <main className="biz-dashboard-main">

      <div className="biz-dashboard-header">
        <h1 className="biz-dashboard-title">Gestionar oferta</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="button" className="btn-primary" onClick={() => navigate('/negocio/crear-oferta')}>
            <span className="material-symbols-outlined">add</span>
            Nueva oferta
          </button>
          <div className="btn-back-wrapper">
            <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
              Volver atrás
            </button>
          </div>
        </div>
      </div>

      <div className="search-form__pills">
        {TABS.map(tab => (
          <span
            key={tab.key}
            className={`search-pill${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </span>
        ))}
      </div>

      <div className="manage-offers-grid">
        {filtered.map(offer => (
          <article key={offer.id} className="manage-offer-card">
            <div className="manage-offer-card__status">
              {offer.status === 'active' ? (
                <span className="biz-service-tag" style={{ backgroundColor: 'var(--primary-color)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>check_circle</span>
                  Activa
                </span>
              ) : (
                <span className="biz-service-tag" style={{ backgroundColor: 'var(--dark-grey)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>schedule</span>
                  Pendiente
                </span>
              )}
            </div>

            <h3 className="manage-offer-card__title">{offer.title}</h3>

            {offer.activity && (
              <p className="manage-offer-card__meta">
                <span className="material-symbols-outlined">local_offer</span>
                {offer.activity}
              </p>
            )}
            {offer.meta && (
              <p className="manage-offer-card__meta">
                <span className="material-symbols-outlined">calendar_month</span>
                {offer.meta}
              </p>
            )}

            <div className="manage-offer-card__actions">
              <button className="biz-stat-btn" style={{ flex: 1 }} type="button" onClick={() => {
                const newTitle = window.prompt('Editar título:', offer.title);
                if (newTitle?.trim()) updateOffer(offer.id, { title: newTitle.trim() });
              }}>
                <span className="material-symbols-outlined">edit</span>
                Editar
              </button>
              <button className="biz-stat-btn" style={{ flex: 1 }} type="button"
                disabled={offer.status === 'pending'}
                onClick={() => updateOffer(offer.id, { status: offer.status === 'active' ? 'paused' : 'active' })}
              >
                <span className="material-symbols-outlined">{offer.status === 'active' ? 'pause' : 'play_arrow'}</span>
                {offer.status === 'active' ? 'Pausar' : 'Activar'}
              </button>
              <button className="biz-stat-btn" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }} type="button"
                onClick={() => { if (window.confirm('¿Borrar esta oferta?')) deleteOffer(offer.id); }}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="plans-user-empty">No hay ofertas en esta categoría.</p>
        )}
      </div>

    </main>
  );
}

export default ManageOffers;
