import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuthStore } from '../../store';

function AdminLayout() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="admin-header">
        <div className="header-left">
          <span className="material-symbols-outlined menu-icon">menu</span>
          <h1 className="header-title">Admin Console</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={handleLogout} style={{ color: 'var(--error)' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="layout-content-wrapper">
        <Outlet />
      </div>

      <Navigation />
    </>
  );
}

export default AdminLayout;
