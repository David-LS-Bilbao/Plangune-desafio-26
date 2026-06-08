import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/language-switcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'eu' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button 
      className="language-switcher-btn" 
      onClick={toggleLanguage}
      aria-label="Cambiar idioma / Aldatu hizkuntza"
    >
      <span className={i18n.language === 'es' ? 'active' : ''}>ES</span>
      <span className="separator">|</span>
      <span className={i18n.language === 'eu' ? 'active' : ''}>EU</span>
    </button>
  );
};

export default LanguageSwitcher;
