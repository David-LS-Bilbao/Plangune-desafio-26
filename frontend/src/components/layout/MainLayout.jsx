import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarResponsive from '../common/NavbarResponsive';
import { FavoritesProvider } from '../../context/FavoritesContext';

function MainLayout() {
  return (
    <FavoritesProvider>
      <NavbarResponsive />
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
    </FavoritesProvider>
  );
}

export default MainLayout;
