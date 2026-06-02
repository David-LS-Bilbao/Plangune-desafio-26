import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/logo.svg'

const NAV_LINKS = [
  { label: 'INICIO', to: '/' },
  { label: 'PLANES', to: '/planes' },
  { label: 'OFERTAS', to: '/ofertas' },
  { label: 'BUSCAR', to: '/planes' },
  { label: 'PERFIL', to: '/perfil' },
];

function Navbar() {

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <Link to="/" aria-label="Ir al inicio">
          <img src={logo} />
        </Link>

        <ul role="list">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
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
