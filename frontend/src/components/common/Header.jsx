import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

function Header() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header-bar">
      <div className="header-content">
        <button aria-label="Menu" className="icon-button">
          <span className="material-symbols-outlined fill" data-icon="menu">menu</span>
        </button>
        
        <div className="title" onClick={() => navigate('/planes')} style={{ cursor: 'pointer' }}>
          TxikiPlan
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button aria-label="Account" className="icon-button" onClick={() => navigate('/perfil')}>
            <span className="material-symbols-outlined" data-icon="family_restroom">family_restroom</span>
          </button>
          
          {user && (
            <button aria-label="Logout" className="icon-button" onClick={handleLogout} style={{ color: 'var(--error)' }}>
              <span className="material-symbols-outlined">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
