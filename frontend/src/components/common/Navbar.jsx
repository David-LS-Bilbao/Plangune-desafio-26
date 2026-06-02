import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'INICIO', to: '/' },
  { label: 'CATEGORÍAS', to: '/categorias' },
  { label: 'OFERTAS', to: '/ofertas' },
  { label: 'BUSCAR', to: '/planes' },
  { label: 'PERFIL', to: '/perfil' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`landing-navbar${scrolled ? ' landing-navbar--scrolled' : ''}`}>
      <div className="landing-navbar__inner">
        <Link to="/" className="landing-navbar__logo" aria-label="Ir al inicio">
          {/* Sustituir src por la ruta real del logo cuando esté disponible */}
          <img
            src="/logo.png"
            alt="TxikiPlan"
            className="landing-navbar__logo-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="landing-navbar__logo-fallback">
            <span className="material-symbols-outlined">location_on</span>
            TxikiPlan
          </span>
        </Link>

        <ul className="landing-navbar__links" role="list">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `landing-navbar__link${isActive ? ' landing-navbar__link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
