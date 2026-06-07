import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarResponsive from '../common/NavbarResponsive';

/**
 * Layout para páginas públicas con navbar pero SIN guard ni FavoritesProvider
 * (p. ej. las ofertas para el consumidor, visibles sin iniciar sesión).
 */
function PublicLayout() {
  return (
    <>
      <NavbarResponsive />
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
    </>
  );
}

export default PublicLayout;
