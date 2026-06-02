import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import Navbar from '../components/common/Navbar';
import heroImage from '../assets/hero-image.webp';

function Landing() {
  return (
    <>
    <Navbar />
    <main className="landing-main">
      <section className="hero-section">
        <div className="hero-background">
          <img src={heroImage} alt="Hero background"/>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-card">
          <h1>Haz planes y disfruta con tus peques</h1>
          <p>Las actividades más seguras, cómodas y divertidas de Euskadi al alcance de tu mano.</p>
          <div className="hero-actions">
            <Link to="/planes" className="btn-primary">
              <span className="material-symbols-outlined">search</span>
              Buscar planes
            </Link>
            <Link to="/negocio" className="btn-outline">
              <span className="material-symbols-outlined">add_business</span>
              Publicar actividad
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="problem-content">
          <div className="problem-text">
            <h2>Salir con peques no debería ser una aventura</h2>
            <p>Sabemos que organizar una salida familiar implica mucha logística. Evita sorpresas desagradables al llegar a tu destino. Con TxikiPlan, puedes comprobar fácilmente si el lugar es accesible para carritos, si dispone de cambiador, o si es adecuado para un día lluvioso.</p>
            <p>Relájate y disfruta del momento. Nosotros nos encargamos de los detalles prácticos.</p>
          </div>
          <div className="problem-visual">
            <div className="blob blob-1"></div>
            <div className="blob blob-2">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </div>
            <div className="blob blob-3">
              <span className="material-symbols-outlined">child_care</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section">
        <div className="how-container">
          <h2>Tu plan familiar en tres pasos</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-bar bar-1"></div>
              <div className="step-icon icon-1">
                <span className="material-symbols-outlined">account_circle</span>
              </div>
              <h3>1. Crea tu perfil familiar</h3>
              <p>Introduce la edad de tus peques y tus preferencias para recibir recomendaciones personalizadas.</p>
            </div>
            <div className="step-card">
              <div className="step-bar bar-2"></div>
              <div className="step-icon icon-2">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <h3>2. Filtra según tus necesidades</h3>
              <p>Busca actividades por ubicación, accesibilidad para carritos, interiores o exteriores, y más.</p>
            </div>
            <div className="step-card">
              <div className="step-bar bar-3"></div>
              <div className="step-icon icon-3">
                <span className="material-symbols-outlined">celebration</span>
              </div>
              <h3>3. Elige un plan recomendado</h3>
              <p>Descubre lugares testados por otras familias y disfruta de un día sin estrés.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Family Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-container">
          <h2>Pensado para familias reales</h2>
          <p className="benefits-subtitle">Toda la información que necesitas saber antes de salir de casa, de un vistazo rápido.</p>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon bg-primary">
                <span className="material-symbols-outlined">child_care</span>
              </div>
              <span>Edad recomendada</span>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon bg-secondary">
                <span className="material-symbols-outlined">stroller</span>
              </div>
              <span>Carrito</span>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon bg-tertiary">
                <span className="material-symbols-outlined">baby_changing_station</span>
              </div>
              <span>Cambiador</span>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon bg-primary">
                <span className="material-symbols-outlined">home</span>
              </div>
              <span>Interior o exterior</span>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon bg-secondary">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <span>Comida cerca</span>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon bg-tertiary">
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
                <span>Añade promociones especiales para usuarios de TxikiPlan.</span>
              </li>
              <li>
                <span className="material-symbols-outlined">check_circle</span>
                <span>Recibe reseñas y construye reputación en la comunidad.</span>
              </li>
              <li>
                <span className="material-symbols-outlined">check_circle</span>
                <span>Aparece en recomendaciones personalizadas.</span>
              </li>
            </ul>
            <Link to="/negocio" className="btn-primary">
              <span className="material-symbols-outlined">add_business</span>
              Publicar mi actividad
            </Link>
          </div>
          <div className="business-image">
            <img alt="Business owner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBibPCCUNLdnrX7gIn-W8ydOjxIdlpGm21DdxUpToo0cs57DJwoS1W1xhYvT1jK7rJoe-ki5ZtDu52ND-wM3TujQqA7RsSqcjIdUhhABR2gmRfISzDAQ0Wj3RPiogQZdeD3w5fiiy-ET2CbB8Qh4-s7gBKCZCz81lbGBZVaIr1hbjTkIkFHX7jpR46IuSU4V-OllqZC0saa1TIpgj5-Jc38IH72fS98LNLJsw_MsSXu-Yk38azx41QhsYvmWNiGnazpJPSwW9MauRPx" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <h2>Empieza a planear tu próxima salida en familia</h2>
        <div className="cta-actions">
          <Link to="/planes" className="btn-primary">
            <span className="material-symbols-outlined">search</span>
            Buscar planes
          </Link>
          <Link to="/negocio" className="btn-outline-dark">
            <span className="material-symbols-outlined">add_business</span>
            Publicar actividad
          </Link>
        </div>
      </section>
    </main>
    </>
  );
}

export default Landing;
