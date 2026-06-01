import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OFFERS = [
  { id: 1, status: 'active', title: '2x1 en menú infantil', activity: 'Comida Familiar de Domingo', icon: 'restaurant', meta: 'Sábados y Domingos (Octubre)' },
  { id: 2, status: 'active', title: 'Plan de lluvia con merienda incluida', activity: 'Parque de Bolas TxikiPark', icon: 'attractions', meta: 'Válido hasta el 15 de Nov' },
  { id: 3, status: 'pending', title: 'Descuento especial fin de semana', activity: 'Teatro Infantil: El Bosque Mágico', icon: 'theater_comedy', meta: '10 Nov - 12 Nov' },
  { id: 4, status: 'active', title: 'Taller gratuito de manualidades', activity: 'Taller de Otoño Creativo', icon: 'palette', meta: 'Todos los Miércoles' },
];

const TABS = [
  { key: 'all', label: 'Todas las ofertas (4)' },
  { key: 'active', label: 'Activas (3)' },
  { key: 'pending', label: 'Pendientes (1)' },
];

function ManageOffers() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? OFFERS : OFFERS.filter(o => o.status === activeTab);

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
                <button className="card-action-btn edit">
                  <span className="material-symbols-outlined">edit</span> Editar
                </button>
                <button className="card-action-btn pause" disabled={offer.status === 'pending'}>
                  <span className="material-symbols-outlined">pause</span> Pausar
                </button>
                <button className="card-action-btn delete">
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
