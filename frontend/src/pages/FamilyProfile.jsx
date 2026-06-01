import React, { useState } from 'react';
import { useAuthStore, useUserStore, usePlansStore } from '../store';
import PlanCard from '../components/common/PlanCard';

function FamilyProfile() {
  const user = useAuthStore(state => state.user);
  const favoritesIds = useUserStore(state => state.favorites);
  const allPlans = usePlansStore(state => state.allPlans);
  
  const favoritePlans = allPlans.filter(p => favoritesIds.includes(p.id));

  const [preferences, setPreferences] = useState({
    carrito: true,
    cambiador: true,
    interior: false,
    presupuesto: true,
    tranquilos: false
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="family-profile-main" style={{ paddingBottom: '5rem' }}>
      {/* Header Profile */}
      <section className="profile-header-section">
        <div className="avatar-wrapper">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
            {user?.avatar || 'FA'}
          </div>
          <button className="btn-edit-avatar">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <p className="profile-description">
          ¡Hola {user?.name || 'Familia'}! Personaliza tu perfil para que podamos recomendarte los mejores planes para tu familia.
        </p>
      </section>

      {/* Saved Favorites Section */}
      <section className="profile-section">
        <div className="section-header">
          <h2 className="section-label mb-0">Planes Guardados ({favoritePlans.length})</h2>
        </div>
        
        {favoritePlans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {favoritePlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <p style={{ marginTop: '1rem', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
            Aún no has guardado ningún plan. Explora y añade a favoritos los que más te gusten.
          </p>
        )}
      </section>

      {/* Location Input */}
      <section className="profile-section">
        <label htmlFor="location" className="section-label">Ubicación habitual</label>
        <div className="input-with-icon">
          <span className="material-symbols-outlined icon">location_on</span>
          <input type="text" id="location" defaultValue="Bilbao" placeholder="Ciudad o código postal" />
        </div>
      </section>

      {/* Children Ages */}
      <section className="profile-section">
        <div className="section-header">
          <h2 className="section-label mb-0">Edades de los peques</h2>
          <button className="btn-text-primary">
            <span className="material-symbols-outlined text-sm">add</span> Añadir
          </button>
        </div>
        
        <div className="children-list">
          {/* Child 1 */}
          <div className="child-item">
            <div className="child-info">
              <div className="child-icon bg-primary-light">
                <span className="material-symbols-outlined">child_care</span>
              </div>
              <div className="child-details">
                <p className="child-type">Bebé</p>
                <p className="child-age">8 meses</p>
              </div>
            </div>
            <button className="btn-icon-danger">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>

          {/* Child 2 */}
          <div className="child-item">
            <div className="child-info">
              <div className="child-icon bg-secondary-light">
                <span className="material-symbols-outlined">face</span>
              </div>
              <div className="child-details">
                <p className="child-type">Niño/a</p>
                <p className="child-age">3 años</p>
              </div>
            </div>
            <button className="btn-icon-danger">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="profile-section">
        <h2 className="section-label">Preferencias de planes</h2>
        <div className="preferences-list">
          {/* Preference 1 */}
          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">stroller</span>
              <span className="preference-text">Uso de carrito</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={preferences.carrito} onChange={() => togglePreference('carrito')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Preference 2 */}
          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">baby_changing_station</span>
              <span className="preference-text">Necesidad de cambiador</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={preferences.cambiador} onChange={() => togglePreference('cambiador')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Preference 3 */}
          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">roofing</span>
              <span className="preference-text">Planes de interior</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={preferences.interior} onChange={() => togglePreference('interior')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Preference 4 */}
          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">savings</span>
              <span className="preference-text">Bajo presupuesto</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={preferences.presupuesto} onChange={() => togglePreference('presupuesto')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Preference 5 */}
          <div className="preference-item border-none">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">self_improvement</span>
              <span className="preference-text">Planes tranquilos</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={preferences.tranquilos} onChange={() => togglePreference('tranquilos')} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      {/* Primary Action */}
      <section className="profile-actions">
        <button className="btn-primary-full">
          Guardar perfil
        </button>
      </section>
    </main>
  );
}

export default FamilyProfile;
