import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo.svg'
import { useAuthStore } from '../../store';

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { t, i18n } = useTranslation();

  const toggleLang = (lang) => {
    i18n.changeLanguage(lang);
  };

  const NAV_LINKS = [
    { label: t('nav.home').toUpperCase(), to: '/' },
    { label: t('nav.plans', 'PLANES').toUpperCase(), to: '/planes' },
    { label: t('nav.offers', 'OFERTAS').toUpperCase(), to: '/ofertas' },
    { label: t('nav.search', 'BUSCAR').toUpperCase(), to: '/buscar' },
    { label: t('nav.profile', 'PERFIL').toUpperCase(), to: user ? '/perfil' : '/login' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <Link to="/" aria-label="Ir al inicio">
          <img src={logo} alt="TxikiPlan logo" />
        </Link>

        <ul role="list" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {NAV_LINKS.map(({ label, to }) => (
            <li key={label}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `navbar-link${isActive ? ' navbar-link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <div className="lang-toggle" style={{ display: 'flex', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
              <span 
                style={{ cursor: 'pointer', textDecoration: i18n.language === 'es' ? 'underline' : 'none', color: i18n.language === 'es' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                onClick={() => toggleLang('es')}
              >
                ES
              </span>
              <span style={{ color: 'var(--outline)' }}>|</span>
              <span 
                style={{ cursor: 'pointer', textDecoration: i18n.language === 'eu' ? 'underline' : 'none', color: i18n.language === 'eu' ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                onClick={() => toggleLang('eu')}
              >
                EU
              </span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
