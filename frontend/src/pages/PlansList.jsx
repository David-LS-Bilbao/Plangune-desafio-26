import React from 'react';
import { Link } from 'react-router-dom';
import { usePlansStore } from '../store';
import PlanCard from '../components/common/PlanCard';

function PlansList() {
  const filteredPlans = usePlansStore(state => state.getFilteredPlans());
  const searchQuery = usePlansStore(state => state.searchQuery);
  const setSearchQuery = usePlansStore(state => state.setSearchQuery);

  return (
    <main className="plans-main-new" style={{ paddingBottom: '5rem' }}>
      {/* Hero Section / Form */}
      <div className="plans-content">
        <h1 className="plans-title">Planes fáciles con peques en Euskadi</h1>
        
        {/* Ofertas */}
        <div className="offers-section">
          <div className="offers-header">
            <h2>Ofertas familiares cerca de ti</h2>
            <button className="btn-link">Ver todas</button>
          </div>
          
          <div className="offers-scroll-container">
            {/* Card 1 */}
            <div className="offer-card offer-card-secondary">
              <div className="offer-card-header">
                <span className="badge badge-secondary">OFERTA</span>
                <span className="offer-date">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Hasta 31 Oct
                </span>
              </div>
              <h3 className="offer-title">2x1 en menú infantil</h3>
              <p className="offer-subtitle">Comida Familiar de Domingo</p>
              <div className="offer-location">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Bilbao
              </div>
              <button className="btn-secondary-full">Ver oferta</button>
            </div>
            
            {/* Card 2 */}
            <div className="offer-card offer-card-primary">
              <div className="offer-card-header">
                <span className="badge badge-primary">TALLER</span>
                <span className="offer-date">
                  <span className="material-symbols-outlined text-sm">event</span>
                  Solo miércoles
                </span>
              </div>
              <h3 className="offer-title">Taller gratuito</h3>
              <p className="offer-subtitle">Taller de Otoño Creativo</p>
              <div className="offer-location">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Getxo
              </div>
              <button className="btn-primary-full">Ver oferta</button>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="search-form-new">
          {/* Location */}
          <div className="form-group">
            <label className="form-label">¿Qué buscas?</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon" data-icon="search">search</span>
              <input 
                type="text" 
                placeholder="Museo, Bilbao, Getxo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Age Filter */}
          <div className="form-group">
            <label className="form-label">Edad de los peques</label>
            <div className="chips-container">
              <label className="chip">
                <input type="checkbox" name="age" value="bebe" className="sr-only" />
                <span className="chip-text">Bebé</span>
              </label>
              <label className="chip">
                <input type="checkbox" name="age" value="1-3" className="sr-only" />
                <span className="chip-text">1-3 años</span>
              </label>
              <label className="chip">
                <input type="checkbox" name="age" value="4-6" className="sr-only" />
                <span className="chip-text">4-6 años</span>
              </label>
            </div>
          </div>

          {/* Features Filter */}
          <div className="form-group">
            <label className="form-label">Sin sobresaltos:</label>
            <div className="checkboxes-container">
              <label className="checkbox-label">
                <input type="checkbox" className="custom-checkbox" />
                <span className="checkbox-text">Carrito</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" className="custom-checkbox" />
                <span className="checkbox-text">Cambiador</span>
              </label>
              <label className="checkbox-label">
                <input type="checkbox" className="custom-checkbox" />
                <span className="checkbox-text">Día de lluvia</span>
              </label>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC PLANS LIST --- */}
        <div className="plans-list-dynamic" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--on-background)', marginBottom: '1rem' }}>
            Resultados de búsqueda
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPlans.length > 0 ? (
              filteredPlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <p style={{ color: 'var(--on-surface-variant)' }}>No se encontraron planes con esa búsqueda.</p>
            )}
          </div>
        </div>

      </div>

      {/* Hero Image */}
      <div className="plans-hero-image" style={{ display: 'none' }}>
        {/* Hiding hero image to prioritize the list of results on this view */}
      </div>
    </main>
  );
}

export default PlansList;
