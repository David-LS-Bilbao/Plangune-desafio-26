import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

function Navigation() {
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  // Hide navigation on landing and login pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  // Admin Navigation
  if (user?.role === 'admin') {
    return (
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--surface-container)', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', borderTop: '1px solid var(--outline-variant)', zIndex: 50 }}>
        <NavLink to="/admin" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
          <span className={`material-symbols-outlined ${location.pathname === '/admin' ? 'fill' : ''}`}>dashboard</span>
          <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Panel</span>
        </NavLink>
        <NavLink to="/admin/data" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
          <span className={`material-symbols-outlined ${location.pathname === '/admin/data' ? 'fill' : ''}`}>analytics</span>
          <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Datos</span>
        </NavLink>
      </nav>
    );
  }

  // Business Navigation
  if (user?.role === 'business') {
    return (
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--surface-container)', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', borderTop: '1px solid var(--outline-variant)', zIndex: 50 }}>
        <NavLink to="/negocio/dashboard" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
          <span className={`material-symbols-outlined ${location.pathname === '/negocio/dashboard' ? 'fill' : ''}`}>home</span>
          <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Inicio</span>
        </NavLink>
        <NavLink to="/negocio/ofertas" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
          <span className={`material-symbols-outlined ${location.pathname === '/negocio/ofertas' ? 'fill' : ''}`}>local_offer</span>
          <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Ofertas</span>
        </NavLink>
        <NavLink to="/negocio" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
          <span className={`material-symbols-outlined ${location.pathname === '/negocio' ? 'fill' : ''}`}>add_circle</span>
          <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Actividad</span>
        </NavLink>
      </nav>
    );
  }

  // Family Navigation (Default)
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--surface-container)', display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', borderTop: '1px solid var(--outline-variant)', zIndex: 50 }}>
      <NavLink to="/planes" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
        <span className={`material-symbols-outlined ${location.pathname === '/planes' ? 'fill' : ''}`}>search</span>
        <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Explorar</span>
      </NavLink>
      <NavLink to="/perfil" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
        <span className={`material-symbols-outlined ${location.pathname === '/perfil' ? 'fill' : ''}`}>favorite</span>
        <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Guardados</span>
      </NavLink>
      <NavLink to="/perfil" style={({isActive}) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)' })}>
        <span className={`material-symbols-outlined ${location.pathname === '/perfil' ? 'fill' : ''}`}>account_circle</span>
        <span style={{ fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>Perfil</span>
      </NavLink>
    </nav>
  );
}

export default Navigation;
