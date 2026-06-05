import React from 'react';
import { Link } from 'react-router-dom';

function PlansResults() {
  return (
    <main className="plans-results-main">
      {/* Header Section */}
      <section className="results-header">
        <h2 className="results-title">Planes en Bilbao</h2>
        
        {/* Tabs */}
        <div className="results-tabs">
          <button className="tab-btn active">Lista</button>
          <button className="tab-btn">Mapa</button>
        </div>
        
        <div className="active-filters">
          <button className="filter-chip">
            <span className="material-symbols-outlined text-sm">local_offer</span>
            Con oferta
          </button>
        </div>
      </section>

      {/* Results List */}
      <section className="results-list">
        {/* Card 1 */}
        <article className="result-card featured">
          <div className="result-image-wrapper">
            <img alt="Museo Marítimo de Bilbao" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhmFffA2HVTJtTRrtrA-DzjYMCk-V4BkFNglMlfPlu_1H00KG6iQavojNNMr5o5N5cEaNwJiMgmrT9EEOQ0W6R2XfTQMSPwbaQ7dAi1jpoaJnjZAzDtxJjAfKajcE4P_KT1Z03e5lKN9pOuReX1NiRpH5-vB_tNPysENG9ZedY8F7zyDy7sLTCE6oMN1H8sF1vswb_8rZpbFg2XWEOYSfBXioai4PbGsW_OuGE_hnAGJrjigs3piewBsKLd1PCAR7TzPlVuNIdZHUL" />
            <button className="favorite-btn">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>
          
          <div className="result-content">
            <div className="offer-tag">
              <span className="material-symbols-outlined text-sm fill">local_offer</span>
              Oferta activa
            </div>
            
            <div className="result-header">
              <h3>Museo Marítimo</h3>
              <div className="rating">
                <span className="material-symbols-outlined fill">star</span>
                <span>4.6</span>
              </div>
            </div>
            
            <div className="tags">
              <span className="tag">
                <span className="material-symbols-outlined text-sm">child_care</span> 1-6 años
              </span>
            </div>
            
            <div className="features">
              <span className="feature"><span className="material-symbols-outlined text-sm">stroller</span> Carrito</span>
              <span className="feature"><span className="material-symbols-outlined text-sm">roofing</span> Interior</span>
              <span className="feature"><span className="material-symbols-outlined text-sm">directions_walk</span> 15 min</span>
            </div>
            
            <div className="card-actions">
              <Link to="/plan/1" className="btn-text">
                Ver detalles <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className="result-card">
          <div className="result-image-wrapper">
            <img alt="Parque Doña Casilda" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByxdWNjNHhakBWla1A38pUnh1T8vvx4N4ZR3zyCrBFBiOm6Q0ciwnobJ6Ma1QMUJcUI39RA47Sw5nEH_1d8t7vzL2148UJ0ukbDvioS15ePdW8OwdsbuhJ3F6t8AnP1egRNA57P73Eiogwb2UDu4Lyo1DYt40cgZENHKZhHnBxIeNC1jpyfhqW7qZj6MkWRz-Pv_6FWx1UtPOVezLSebb918B2MZm4mUWEeuceiwWmaVzjrprhWq_ZiFOtMbAkimbMFRu4ZyUC1wWD" />
            <button className="favorite-btn outline">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>
          
          <div className="result-content">
            <div className="result-header mt-4">
              <h3>Parque Doña Casilda</h3>
              <div className="rating">
                <span className="material-symbols-outlined fill">star</span>
                <span>4.4</span>
              </div>
            </div>
            
            <div className="tags">
              <span className="tag primary">
                <span className="material-symbols-outlined text-sm">child_care</span> 0-6 años
              </span>
            </div>
            
            <div className="features">
              <span className="feature text-primary"><span className="material-symbols-outlined text-sm">sell</span> Gratis</span>
              <span className="feature"><span className="material-symbols-outlined text-sm">park</span> Exterior</span>
              <span className="feature"><span className="material-symbols-outlined text-sm">directions_walk</span> 10 min</span>
            </div>
            
            <div className="card-actions">
              <Link to="/plan/2" className="btn-text">
                Ver detalles <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className="result-card featured">
          <div className="result-image-wrapper">
            <img alt="Taller de cuentos" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIO76iIvJR1t1FmEXHHO_poKKJmwfPue9GkTkONAq7-iemiORSm2C0YotRwrz3GZzaHUchuisz59gEx7mFQwPBL7_psennCmhONpR_qmO7VSJUzGjKQeCa3RJBJR46VkPuhnqqZl3v73JaOt_V4NwS25bqvqCL15jrhXZ03N3Ued4wy--3FNOd8MYubzJyt3z7xZVwWMj5qITsisIRvwPE3WRbJJIBX-WgZdbYZ5QDzx9Yv8TXh95-VE1AvttZeykkjMw_ndzoHAAk" />
            <button className="favorite-btn outline">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>
          
          <div className="result-content">
            <div className="offer-tag">
              <span className="material-symbols-outlined text-sm fill">local_offer</span>
              Oferta activa
            </div>
            
            <div className="result-header">
              <h3>Taller de cuentos</h3>
              <div className="rating">
                <span className="material-symbols-outlined fill">star</span>
                <span>4.8</span>
              </div>
            </div>
            
            <div className="tags">
              <span className="tag">
                <span className="material-symbols-outlined text-sm">child_care</span> 3-6 años
              </span>
            </div>
            
            <div className="features">
              <span className="feature"><span className="material-symbols-outlined text-sm">roofing</span> Interior</span>
              <span className="feature"><span className="material-symbols-outlined text-sm">baby_changing_station</span> Cambiador</span>
            </div>
            
            <div className="card-actions">
              <Link to="/plan/3" className="btn-text">
                Ver detalles <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default PlansResults;
