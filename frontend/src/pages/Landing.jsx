import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import Navbar from '../components/common/NavbarResponsive';
import heroImage from '../assets/hero-image.webp';
import businessImage from '../assets/business-espectacle.webp';
import logoTemp from '../assets/logo-temp.svg';

function Landing() {
  return (
    <>
      <Navbar />
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-background">
            <img src={heroImage} alt="Hero background" />
            <div className="hero-overlay"></div>
          </div>

          <div className="hero-card">
            <h1>Haz planes y disfruta con tus peques</h1>
            <p>Las actividades más divertidas, seguras y cómodas de Euskadi al alcance de tu mano.</p>
            <div className="hero-btn-wrapper">
              <Link to="/planes" className="btn-search-plans">
                <span className="material-symbols-outlined">search</span>
                Buscar planes
              </Link>

            </div>
          </div>
        </section>

        <section className="problem-section">
          <div className="problem-wrapper">
            <div className="problem-text">
              <h2>Salir con tus peques: una aventura de las buenas</h2>
              <p>Explora lugares pensados para disfrutar y encuentra de un vistazo toda la información que te ayude a elegir el plan perfecto para cada día.</p>
              <p>Con <span className='logo-name'>plangune</span>, puedes consultar los servicios familiares, la accesibilidad, las opciones para cualquier clima y todos esos detalles que hacen que una salida se convierta en algo inolvidable.</p>
              <p>Más tiempo para compartir. Más tiempo para disfrutar.</p>
            </div>
            <div className="problem-visual">
              <img src={logoTemp} alt="TxikiPlan logo" />
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="how-container">
            <h2>Tu plan familiar en tres pasos</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon icon-1">
                  <span className="material-symbols-outlined">account_circle</span>
                </div>
                <h3>1. Crea tu perfil familiar</h3>
                <p>Introduce la edad de tus peques y tus preferencias para recibir recomendaciones personalizadas.</p>
              </div>
              <div className="step-card">
                <div className="step-icon icon-2">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <h3>2. Filtra según tus necesidades</h3>
                <p>Busca actividades por ubicación, accesibilidad para carritos, interiores o exteriores, y más.</p>
              </div>
              <div className="step-card">
                <div className="step-icon icon-3">
                  <span className="material-symbols-outlined">celebration</span>
                </div>
                <h3>3. Elige un plan recomendado</h3>
                <p>Mira las valoraciones de otras familias y disfruta de un día sin estrés.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <div className="benefits-container">
            <h2>Pensado para familias como la tuya</h2>
            <p className="benefits-subtitle">Encuentra de un sólo vistazo toda la información que necesitas saber.</p>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">child_care</span>
                </div>
                <span>Edad recomendada</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">stroller</span>
                </div>
                <span>Carrito</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">baby_changing_station</span>
                </div>
                <span>Cambiador</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">home</span>
                </div>
                <span>Interior o exterior</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <span>Comida cerca</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">spa</span>
                </div>
                <span>Nivel de estrés</span>
              </div>
            </div>
          </div>
        </section>

        {/* Business Section */}
        <section className="business-section">
          <div className="business-container">
            <div className="business-content">
              <span className="business-label">Para empresas y entidades</span>
              <h2>Haz visible tu actividad familiar</h2>
              <ul>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Publica actividades y eventos dirigidos a familias.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Añade promociones especiales para usuarios de <span className='logo-name'>plangune</span>.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Recibe reseñas y construye una reputación en la comunidad.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Aparece en recomendaciones personalizadas.</span>
                </li>
              </ul>
              <Link to="/negocio" className="btn-business">
                <span className="material-symbols-outlined">add_business</span>
                Publicar mi actividad
              </Link>
            </div>
            <div className="business-image">
              <img alt="Business owner" src={businessImage} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-section">
          <h2>Vive el plan perfecto con tu familia</h2>
          <div className="cta-actions">
            <Link to="/planes" className="btn-cta">
              <span className="material-symbols-outlined">search</span>
              Buscar planes
            </Link>

          
          </div>
        </section>
      </main>
    </>
  );
}

export default Landing;
