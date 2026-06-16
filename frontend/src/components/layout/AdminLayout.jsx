import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarResponsive from '../common/NavbarResponsive';

function AdminLayout() {
  return (
    <>
      <NavbarResponsive />
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
    </>
  );
}

export default AdminLayout;
