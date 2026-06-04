import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import '../styles/landing.css';
import Navbar from '../components/common/Navbar';
import heroImage from '../assets/hero-image.webp';
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
            <h1>{t('landing.heroTitle')}</h1>
            <p>{t('landing.heroSubtitle')}</p>
            <div className="hero-btn-wrapper">
              <Link to="/planes" className="btn-search-plans">
                <span className="material-symbols-outlined">search</span>
                {t('landing.ctaSearch')}
              </Link>
            </div>
          </div>
        </section>

        <section className="problem-section">
          <div className="problem-wrapper">
            <div className="problem-text">
              <h2>{t('landing.problemTitle')}</h2>
              <p>{t('landing.problemP1')}</p>
              <p>
                <Trans i18nKey="landing.problemP2">
                  Con <span className='logo-name'>plangune</span>, puedes consultar los servicios familiares, la accesibilidad, las opciones para cualquier clima y todos esos detalles que hacen que una salida se convierta en algo inolvidable.
                </Trans>
              </p>
              <p>{t('landing.problemP3')}</p>
            </div>
            <div className="problem-visual">
              <img src={logoTemp} alt="TxikiPlan logo" />
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <div className="how-container">
            <h2>{t('landing.howItWorksTitle')}</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-bar"></div>
                <div className="step-icon icon-1">
                  <span className="material-symbols-outlined">account_circle</span>
                </div>
                <h3>{t('landing.step1Title')}</h3>
                <p>{t('landing.step1Desc')}</p>
              </div>
              <div className="step-card">
                <div className="step-bar"></div>
                <div className="step-icon icon-2">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <h3>{t('landing.step2Title')}</h3>
                <p>{t('landing.step2Desc')}</p>
              </div>
              <div className="step-card">
                <div className="step-bar"></div>
                <div className="step-icon icon-3">
                  <span className="material-symbols-outlined">celebration</span>
                </div>
                <h3>{t('landing.step3Title')}</h3>
                <p>{t('landing.step3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Family Benefits Section */}
        <section className="benefits-section">
          <div className="benefits-container">
            <h2>{t('landing.benefitsTitle')}</h2>
            <p className="benefits-subtitle">{t('landing.benefitsSubtitle')}</p>

            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon bg-primary">
                  <span className="material-symbols-outlined">child_care</span>
                </div>
                <span>{t('landing.benefit1')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon bg-secondary">
                  <span className="material-symbols-outlined">stroller</span>
                </div>
                <span>{t('landing.benefit2')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon bg-tertiary">
                  <span className="material-symbols-outlined">baby_changing_station</span>
                </div>
                <span>{t('landing.benefit3')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon bg-primary">
                  <span className="material-symbols-outlined">home</span>
                </div>
                <span>{t('landing.benefit4')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon bg-secondary">
                  <span className="material-symbols-outlined">restaurant</span>
                </div>
                <span>{t('landing.benefit5')}</span>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon bg-tertiary">
                  <span className="material-symbols-outlined">spa</span>
                </div>
                <span>{t('landing.benefit6')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Business Section */}
        <section className="business-section">
          <div className="business-container">
            <div className="business-content">
              <span className="business-label">{t('landing.businessLabel')}</span>
              <h2>{t('landing.businessTitle')}</h2>
              <ul>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.businessBullet1')}</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.businessBullet2')}</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.businessBullet3')}</span>
                </li>
                <li>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{t('landing.businessBullet4')}</span>
                </li>
              </ul>
              <Link to="/negocio" className="btn-primary">
                <span className="material-symbols-outlined">add_business</span>
                {t('landing.ctaBusiness')}
              </Link>
            </div>
            <div className="business-image">
              <img alt="Business owner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBibPCCUNLdnrX7gIn-W8ydOjxIdlpGm21DdxUpToo0cs57DJwoS1W1xhYvT1jK7rJoe-ki5ZtDu52ND-wM3TujQqA7RsSqcjIdUhhABR2gmRfISzDAQ0Wj3RPiogQZdeD3w5fiiy-ET2CbB8Qh4-s7gBKCZCz81lbGBZVaIr1hbjTkIkFHX7jpR46IuSU4V-OllqZC0saa1TIpgj5-Jc38IH72fS98LNLJsw_MsSXu-Yk38azx41QhsYvmWNiGnazpJPSwW9MauRPx" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-section">
          <h2>{t('landing.finalCtaTitle')}</h2>
          <div className="cta-actions">
            <Link to="/planes" className="btn-primary">
              <span className="material-symbols-outlined">search</span>
              {t('landing.ctaSearch')}
            </Link>
            <Link to="/negocio" className="btn-outline-dark">
              <span className="material-symbols-outlined">add_business</span>
              {t('landing.finalCtaBusiness')}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default Landing;
