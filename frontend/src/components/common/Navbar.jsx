import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/logo.svg'
import { useAuthStore } from '../../store';

function Navbar() {
  const user = useAuthStore((state) => state.user);

  const NAV_LINKS = [
    { label: 'INICIO', to: '/' },
    { label: 'PLANES', to: '/planes' },
    { label: 'OFERTAS', to: '/ofertas' },
    { label: 'BUSCAR', to: '/buscar' },
    { label: 'PERFIL', to: user ? '/perfil' : '/login' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <Link to="/" aria-label="Ir al inicio">
          <img src={logo} alt="Plangune logo" />
        </Link>

        <ul role="list">
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
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
