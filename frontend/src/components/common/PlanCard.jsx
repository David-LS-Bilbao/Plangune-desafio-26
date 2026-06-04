import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function PlanCard({ plan }) {
  const { t } = useTranslation();
  return (
    <Link to={`/planes/${plan.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ 
        backgroundColor: 'var(--surface-container-lowest)', 
        borderRadius: '0.75rem', 
        overflow: 'hidden',
        border: '1px solid var(--outline-variant)',
        boxShadow: '0 4px 12px rgba(16,25,60,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ position: 'relative', height: '160px' }}>
          <img src={plan.image} alt={plan.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {plan.isIdeal && (
            <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>stars</span>
              {t('planCard.ideal')}
            </span>
          )}
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>{plan.title}</h3>
            <span style={{ color: 'var(--tertiary-container)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '14px' }}>
              <span className="material-symbols-outlined fill" style={{ fontSize: '16px' }}>star</span>
              {plan.rating}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
            {plan.location}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{ backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '12px' }}>{plan.category}</span>
            <span style={{ backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '12px' }}>{plan.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PlanCard;
