import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBusinessStore } from '../store';

function ManageOffers() {
  const [activeTab, setActiveTab] = useState('all');
  const { offers, updateOffer, deleteOffer } = useBusinessStore();

  const TABS = [
    { key: 'all', label: `Todas las ofertas (${offers.length})` },
    { key: 'active', label: `Activas (${offers.filter(o => o.status === 'active').length})` },
    { key: 'pending', label: `Pendientes (${offers.filter(o => o.status === 'pending').length})` },
  ];

  const filtered = activeTab === 'all' ? offers : offers.filter(o => o.status === activeTab);

  return (
    <main className="manage-offers-main">
      {/* Hero Header */}
      <div className="offers-hero-header">
        <div className="offers-hero-bg-accent"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Gestión de Ofertas</h1>
            <p className="hero-subtitle">
              Atrae más familias a tus planes creando promociones puntuales. Gestiona la visibilidad y estado de tus descuentos activos.
            </p>
          </div>
          <Link to="/negocio/crear-oferta" className="btn-primary-hero">
            <span className="material-symbols-outlined">add</span>
            Nueva Oferta
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div className="offers-content-container">
        {/* Filter Tabs */}
        <div className="offers-filter-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="offers-grid">
          {filtered.map(offer => (
            <article key={offer.id} className="offer-card-manage">
              <div className="offer-card-body">
                {/* Status Chip */}
                <div className="offer-status-row">
                  {offer.status === 'active' ? (
                    <span className="status-chip active">
                      <span className="material-symbols-outlined fill">check_circle</span>
                      Oferta activa
                    </span>
                  ) : (
                    <span className="status-chip pending">
                      <span className="material-symbols-outlined">schedule</span>
                      Pendiente de revisión
                    </span>
                  )}
                </div>

                <h3 className="offer-card-title">{offer.title}</h3>

                <div className="offer-card-meta">
                  <div className="meta-row">
                    <span className="material-symbols-outlined text-outline">{offer.icon}</span>
                    <span className="truncate">{offer.activity}</span>
                  </div>
                  <div className="meta-row">
                    <span className="material-symbols-outlined text-outline">calendar_month</span>
                    <span>{offer.meta}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="offer-card-actions">
                <button className="card-action-btn edit" onClick={() => {
                  const newTitle = window.prompt('Editar título de la oferta:', offer.title);
                  if (newTitle && newTitle.trim() !== '') {
                    updateOffer(offer.id, { title: newTitle.trim() });
                  }
                }}>
                  <span className="material-symbols-outlined">edit</span> Editar
                </button>
                <button 
                  className="card-action-btn pause" 
                  disabled={offer.status === 'pending'}
                  onClick={() => updateOffer(offer.id, { status: offer.status === 'active' ? 'paused' : 'active' })}
                >
                  <span className="material-symbols-outlined">{offer.status === 'active' ? 'pause' : 'play_arrow'}</span> 
                  {offer.status === 'active' ? 'Pausar' : 'Activar'}
                </button>
                <button className="card-action-btn delete" onClick={() => {
                  if (window.confirm("¿Seguro que quieres borrar esta oferta?")) {
                    deleteOffer(offer.id);
                  }
                }}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ManageOffers;
