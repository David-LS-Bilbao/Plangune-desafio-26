import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { useAuthStore } from '../../store';
import '../../styles/navbar-responsive.css';

function NavbarResponsive() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const defaultLinks = [
    { to: '/ofertas', icon: 'local_offer', label: 'Ofertas', exact: false },
    { to: '/planes', icon: 'event', label: 'Planes', exact: false },
    { to: '/', icon: 'home', label: 'Inicio', exact: true },
    { to: '/buscar', icon: 'search', label: 'Buscar', exact: false },
    { to: user ? '/perfil' : '/login', icon: 'account_circle', label: 'Perfil', exact: false },
  ];

  const adminLinks = [
    { to: '/admin', icon: 'dashboard', label: 'Panel', exact: true },
    { to: '/admin/data', icon: 'analytics', label: 'Datos', exact: true },
  ];

  const businessLinks = [
    { to: '/negocio/dashboard', icon: 'home', label: 'Inicio', exact: true },
    { to: '/negocio/ofertas', icon: 'local_offer', label: 'Ofertas', exact: false },
    { to: '/negocio', icon: 'add_circle', label: 'Actividad', exact: true },
  ];

  const links =
    user?.role === 'admin' ? adminLinks :
    user?.role === 'business' ? businessLinks :
    defaultLinks;

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
      { label: 'Inicio', path: '/', icon: 'home' },
      { label: 'Explorar planes', path: '/planes', icon: 'explore' },
      { label: 'Iniciar sesión', path: '/login', icon: 'login' },
    ];
    if (user.role === 'family') return [
      { label: 'Inicio', path: '/', icon: 'home' },
      { label: 'Explorar planes', path: '/planes', icon: 'explore' },
      { label: 'Favoritos', path: '/favoritos', icon: 'favorite' },
      { label: 'Mi perfil', path: '/perfil', icon: 'person' },
      { label: 'Ofertas', path: '/ofertas', icon: 'local_offer' },
    ];
    if (user.role === 'business') return [
      { label: 'Dashboard', path: '/negocio/dashboard', icon: 'dashboard' },
      { label: 'Mis ofertas', path: '/negocio/ofertas', icon: 'local_offer' },
      { label: 'Rendimiento', path: '/negocio/rendimiento', icon: 'bar_chart' },
      { label: 'Estrategia', path: '/negocio/estrategia', icon: 'rocket_launch' },
      { label: 'Suscripción', path: '/negocio/suscripcion', icon: 'workspace_premium' },
    ];
    if (user.role === 'admin') return [
      { label: 'Panel admin', path: '/admin', icon: 'admin_panel_settings' },
      { label: 'Datos', path: '/admin/datos', icon: 'database' },
    ];
    return [];
  })();

  return (
    <>
      {/* ── MOBILE: header superior (< 768px) ────────────────────────────── */}
      <header className="nr-mobile-header">
        <div className="nr-mobile-header-content">
          {/* Logo a la izquierda */}
          <Link to="/" aria-label="Ir al inicio" className="nr-mobile-logo">
            <img src={logo} alt="TxikiPlan logo" />
          </Link>

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
              Cerrar sesión
            </button>
          )}
          {user && (
            <div className="nr-menu-user-info">
              <div>
                <p className="nr-menu-user-name">{user.name}</p>
                <p className="nr-menu-user-role">
                  {user.role === 'family' ? 'Familia' : user.role === 'business' ? 'Negocio' : 'Administrador'}
                </p>
              </div>
              <div className="nr-menu-avatar">{user.avatar}</div>
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE: barra inferior con iconos (< 768px) ───────────────────── */}
      <nav className="nr-bottom-nav">
        {links.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `nr-bottom-link${isActive ? ' nr-bottom-link--active' : ''}`
            }
          >
            <span className={`material-symbols-outlined${isActive(to, exact) ? ' fill' : ''}`}>
              {icon}
            </span>
            <span className="nr-bottom-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── DESKTOP: navbar horizontal superior (>= 768px) ───────────────── */}
      <nav className="nr-top-navbar">
        <div className="nr-top-wrapper">
          <Link to="/" aria-label="Ir al inicio">
            <img src={logo} alt="TxikiPlan logo" />
          </Link>
          <ul role="list">
            {links.map(({ to, label, exact }) => (
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
          </ul>
        </div>
      </nav>
    </>
  );
}

export default NavbarResponsive;
