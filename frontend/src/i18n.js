import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationES from './locales/es.json';
import translationEU from './locales/eu.json';

const resources = {
  es: {
    translation: translationES
  },
  eu: {
    translation: translationEU
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    // Si no hay idioma detectado o seleccionado, usará 'eu' (euskera) como preferido
    lng: localStorage.getItem('i18nextLng') || 'eu', 
    interpolation: {
      escapeValue: false // React ya hace el escape por defecto contra XSS
    }
  });

export default i18n;
