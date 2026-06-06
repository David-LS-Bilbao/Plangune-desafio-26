import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarResponsive from '../common/NavbarResponsive';

function MainLayout() {
  return (
    <>
      <NavbarResponsive />
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
    </>
  );
}

export default MainLayout;
