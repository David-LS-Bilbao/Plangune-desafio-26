import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuthStore } from '../../store';

function BusinessLayout() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="business-header">
        <div className="header-left">
          <span className="material-symbols-outlined menu-icon">menu</span>
          <h1 className="header-title">TxikiPlan Negocios</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn"><span className="material-symbols-outlined">notifications</span></button>
          <div className="user-profile">
            <div className="avatar-sm bg-primary">{user?.avatar || 'TP'}</div>
            <button className="icon-btn" onClick={handleLogout} style={{ color: 'var(--error)' }}><span className="material-symbols-outlined">logout</span></button>
          </div>
        </div>
      </header>
      
      <div className="layout-content-wrapper">
        <Outlet />
      </div>
      
      <Navigation />
    </>
  );
}

export default BusinessLayout;
