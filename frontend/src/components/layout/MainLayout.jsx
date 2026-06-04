import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Navigation from './Navigation';

function MainLayout() {
  return (
    <>
      <Header />
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
      <Navigation />
    </>
  );
}

export default MainLayout;
