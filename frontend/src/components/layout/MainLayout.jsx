import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarResponsive from '../common/NavbarResponsive';
import GuniFabLauncher from '../assistant/GuniFabLauncher';
import { FavoritesProvider } from '../../context/FavoritesContext';

function MainLayout() {
  return (
    <FavoritesProvider>
      <NavbarResponsive />
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
      <GuniFabLauncher />
    </FavoritesProvider>
  );
}

export default MainLayout;
