import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store';
import LanguageSwitcher from './LanguageSwitcher';
import '../../styles/navbar-responsive.css';

function NavbarResponsive() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  const defaultLinks = [
    { to: '/ofertas', icon: 'local_offer', label: t('nav.offers'), exact: false },
    { to: '/planes', icon: 'event', label: t('nav.plans'), exact: false },
    { to: '/', icon: 'home', label: t('nav.home'), exact: true },
    { to: '/buscar', icon: 'search', label: t('nav.search'), exact: false },
    { to: user ? '/perfil' : '/login', icon: 'account_circle', label: t('nav.profile'), exact: false },
  ];

  const adminLinks = [
    { to: '/admin', icon: 'dashboard', label: t('nav.dashboard'), exact: true },
    { to: '/admin/data', icon: 'analytics', label: t('nav.data'), exact: true },
  ];

  const businessLinks = [
    { to: '/negocio/ofertas', icon: 'local_offer', label: t('nav.offers'), exact: true },
    { to: '/negocio', icon: 'event', label: t('nav.activities'), exact: true },
    { to: '/negocio/dashboard', icon: 'dashboard', label: t('nav.dashboard'), exact: true },
    { to: '/negocio/resenas', icon: 'reviews', label: t('nav.reviews'), exact: false },
    { to: '/negocio/rendimiento', icon: 'bar_chart', label: t('nav.performance'), exact: false },
  ];

  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'business' ? businessLinks :
    defaultLinks;

  const defaultDesktopLinks = [
    { to: '/ofertas', label: t('nav.offers'), exact: false },
    { to: '/planes', label: t('nav.plans'), exact: false },
    { to: '/favoritos', label: t('nav.favorites'), exact: false },
    { to: '/buscar', label: t('nav.search'), exact: false },
    { to: user ? '/perfil' : '/login', label: t('nav.profile'), exact: false },
  ];

  const businessDesktopLinks = [
    { to: '/negocio/dashboard', label: t('nav.dashboard'), exact: true },
  ];

  const desktopLinks =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'business' ? businessDesktopLinks :
    defaultDesktopLinks;

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const menuItems = (() => {
    if (!user) return [
      { label: t('nav.login'), path: '/login', icon: 'login' },
      { label: t('nav.plans'), path: '/planes', icon: 'explore' },
    ];
    if (user.role === 'family') return [
      { label: t('nav.search'), path: '/buscar', icon: 'search' },
      { label: t('nav.offers'), path: '/ofertas', icon: 'local_offer' },
      { label: t('nav.plans'), path: '/planes', icon: 'explore' },
      { label: t('nav.favorites'), path: '/favoritos', icon: 'favorite' },
      { label: t('nav.profile'), path: '/perfil', icon: 'person' },
    ];
    if (user.role === 'business') return [
      { label: t('nav.dashboard'), path: '/negocio/dashboard', icon: 'dashboard' },
      { label: t('nav.activities'), path: '/negocio', icon: 'event' },
      { label: t('nav.offers'), path: '/negocio/ofertas', icon: 'local_offer' },
      { label: t('nav.performance'), path: '/negocio/rendimiento', icon: 'bar_chart' },
      { label: t('nav.reviews'), path: '/negocio/resenas', icon: 'reviews' },
      { label: t('nav.visibility'), path: '/negocio/estrategia', icon: 'rocket_launch' },
      { label: t('nav.subscription'), path: '/negocio/suscripciones', icon: 'workspace_premium' },
      { label: t('nav.edit_profile'), path: '/negocio/perfil', icon: 'person' },
    ];
    if (user.role === 'admin') return [
      { label: t('nav.dashboard'), path: '/admin', icon: 'admin_panel_settings' },
      { label: t('nav.data'), path: '/admin/data', icon: 'database' },
    ];
    return [];
  })();

  return (
    <>
      {/* ── MOBILE: header superior (< 840px) ────────────────────────────── */}
      <header className="nr-mobile-header">
        <div className="nr-mobile-header-content">
          {/* Logo a la izquierda */}
          <Link to="/" aria-label="Ir al inicio" className="nr-mobile-logo">
            <img src={logo} alt="Plangune logo" />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageSwitcher />
            {/* Botón hamburguesa / X a la derecha */}
            <button
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="nr-icon-button"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`material-symbols-outlined nr-menu-icon${menuOpen ? ' nr-menu-icon--open' : ''}`}>
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Overlay: oscurece debajo del header pero no el header mismo */}
        <div
          className={`nr-menu-overlay${menuOpen ? ' nr-menu-overlay--visible' : ''}`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Menú desplegable con animación */}
        <div className={`nr-menu${menuOpen ? ' nr-menu--open' : ''}`}>
          {menuItems.map((item) => (
            <button key={item.path} type="button" className="nr-menu-item" onClick={() => goTo(item.path)}>
              {item.label}
            </button>
          ))}
          {user && (
            <button type="button" className="nr-menu-item nr-menu-item-danger" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          )}
          {user && (
            <div className="nr-menu-user-info">
              <div>
                <p className="nr-menu-user-name">{user.name}</p>
                <p className="nr-menu-user-role">
                  {user.role === 'family' ? t('roles.family') : user.role === 'business' ? t('roles.business') : t('roles.admin')}
                </p>
              </div>
              <div className="nr-menu-avatar">{user.avatar}</div>
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE: barra inferior con iconos (< 840px) ───────────────────── */}
      <nav className="nr-bottom-nav">
        {(() => {
          const renderLink = ({ to, icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `nr-bottom-link${isActive ? ' nr-bottom-link--active' : ''}`
              }
            >
              <span className={`material-symbols-outlined${isActive(to, exact) ? ' fill' : ''}`}>{icon}</span>
              <span className="nr-bottom-label">{label}</span>
            </NavLink>
          );

          if (links.length < 3) {
            return <>{links.map(renderLink)}</>;
          }

          const fabIndex = links.length === 3 ? 1 : 2;
          const leftLinks = links.slice(0, fabIndex);
          const rightLinks = links.slice(fabIndex + 1);
          const fab = links[fabIndex];

          return (
            <>
              {leftLinks.map(renderLink)}
              {/* Hueco central para el FAB */}
              <div className="nr-bottom-gap" aria-hidden="true" />
              {rightLinks.map(renderLink)}
              {/* FAB flotante — fuera del flujo, centrado con CSS */}
              <NavLink
                to={fab.to}
                end={fab.exact}
                className={({ isActive }) =>
                  `nr-bottom-fab${isActive ? ' nr-bottom-link--active' : ''}`
                }
                aria-label={fab.label}
              >
                <span className={`material-symbols-outlined${isActive(fab.to, fab.exact) ? ' fill' : ''}`}>{fab.icon}</span>
              </NavLink>
            </>
          );
        })()}
      </nav>

      {/* ── DESKTOP: navbar horizontal superior (>= 840px) ───────────────── */}
      <nav className="nr-top-navbar">
        <div className="nr-top-wrapper">
          <Link to="/" aria-label="Ir al inicio">
            <img src={logo} alt="Plangune logo" />
          </Link>
          <ul role="list">
            {desktopLinks.map(({ to, label, exact }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `nr-top-link${isActive ? ' nr-top-link--active' : ''}`
                  }
                >
                  {label.toUpperCase()}
                </NavLink>
              </li>
            ))}
            {user && (
              <li>
                <button className="nr-top-link nr-top-link--logout" onClick={handleLogout}>
                  {t('nav.logout_upper')}
                </button>
              </li>
            )}
            <li className="nr-top-lang-item">
              <LanguageSwitcher />
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NavbarResponsive;
