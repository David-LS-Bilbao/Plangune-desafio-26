import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import '../styles/landing.css';
import Navbar from '../components/common/NavbarResponsive';
import GuniFabLauncher from '../components/assistant/GuniFabLauncher';
import heroImage from '../assets/hero-image.webp';
import businessImage from '../assets/business-espectacle.webp';
import logoTemp from '../assets/logo-temp.svg';

function Landing() {
  const { t } = useTranslation();
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
            <h1>{t('landing.hero_title')}</h1>
            <p>{t('landing.hero_subtitle')}</p>
            <div className="hero-btn-wrapper">
              <Link to="/planes" className="btn-search-plans">
                <span className="material-symbols-outlined">search</span>
                {t('landing.search_plans')}
              </Link>

            </div>
          </div>
        </section>

        <section className="problem-section">
          <div className="problem-wrapper">
            <div className="problem-text">
              <h2>{t('landing.problem_title')}</h2>
              <p>{t('landing.problem_p1')}</p>
              <p>
                <Trans i18nKey="landing.problem_p2">
                  Con <span className='logo-name'>plangune</span>, puedes consultar los servicios familiares, la accesibilidad, las opciones para cualquier clima y todos esos detalles que hacen que una salida se convierta en algo inolvidable.
                </Trans>
              </p>
              <p>{t('landing.problem_p3')}</p>
            </div>
            <div className="problem-visual">
              <img src={logoTemp} alt="Plangune logo" />
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="how-container">
            <h2>{t('landing.steps_title')}</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon icon-1">
                  <span className="material-symbols-outlined">account_circle</span>
                </div>
                <h3>{t('landing.step1_title')}</h3>
                <p>{t('landing.step1_desc')}</p>
              </div>
              <div className="step-card">
                <div className="step-icon icon-2">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <h3>{t('landing.step2_title')}</h3>
                <p>{t('landing.step2_desc')}</p>
              </div>
              <div className="step-card">
                <div className="step-icon icon-3">
                  <span className="material-symbols-outlined">celebration</span>
                </div>
                <h3>{t('landing.step3_title')}</h3>
                <p>{t('landing.step3_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <div className="benefits-container">
            <h2>{t('landing.benefits_title')}</h2>
            <p className="benefits-subtitle">{t('landing.benefits_subtitle')}</p>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">child_care</span>
                </div>
                <span>{t('landing.benefit_age')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">stroller</span>
                </div>
                <span>{t('landing.benefit_stroller')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">baby_changing_station</span>
                </div>
                <span>{t('landing.benefit_changer')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">home</span>
                </div>
                <span>{t('landing.benefit_indoor')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <span>{t('landing.benefit_food')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <span className="material-symbols-outlined">spa</span>
                </div>
                <span>{t('landing.benefit_stress')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Business Section */}
        <section className="business-section">
          <div className="business-container">
            <div className="business-content">
              <span className="business-label">{t('landing.business_label')}</span>
              <h2>{t('landing.business_title')}</h2>
              <ul>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.business_item1')}</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>
                    <Trans i18nKey="landing.business_item2">
                      Añade promociones especiales para usuarios de <span className='logo-name'>plangune</span>.
                    </Trans>
                  </span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.business_item3')}</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.business_item4')}</span>
                </li>
              </ul>
              <Link to="/negocio" className="btn-business">
                <span className="material-symbols-outlined">add_business</span>
                {t('landing.business_btn')}
              </Link>
            </div>
            <div className="business-image">
              <img alt="Business owner" src={businessImage} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-section">
          <h2>{t('landing.cta_title')}</h2>
          <div className="cta-actions">
            <Link to="/planes" className="btn-cta">
              <span className="material-symbols-outlined">search</span>
              {t('landing.search_plans')}
            </Link>

          
          </div>
        </section>
      </main>

      <GuniFabLauncher />
    </>
  );
}

export default Landing;
