import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationES from './src/locales/es.json';

window.scrollTo = () => {};

// i18n para los tests: inicializamos el singleton i18next con los recursos reales en español
// y `lng: 'es'` fijo. Sin esto, `useTranslation()` devolvería las claves crudas (p. ej.
// "nav.plans") en lugar del texto, y los tests que asertan sobre el texto visible fallarían.
// No usamos LanguageDetector aquí (a diferencia de src/i18n.js) para que el idioma sea
// determinista en CI, independiente de localStorage o del entorno.
i18n.use(initReactI18next).init({
  resources: { es: { translation: translationES } },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

// Node 25 inyecta un `localStorage` global incompleto (stub sin métodos cuando no se pasa
// --localstorage-file), y vitest no lo sustituye por el de jsdom. Instalamos uno funcional
// para que getItem/setItem/removeItem/clear estén disponibles en los tests.
class LocalStorageMock {
  #s = new Map();
  get length() { return this.#s.size; }
  clear() { this.#s.clear(); }
  getItem(k) { return this.#s.has(k) ? this.#s.get(k) : null; }
  setItem(k, v) { this.#s.set(String(k), String(v)); }
  removeItem(k) { this.#s.delete(k); }
  key(i) { return [...this.#s.keys()][i] ?? null; }
}
vi.stubGlobal('localStorage', new LocalStorageMock());
vi.stubGlobal('sessionStorage', new LocalStorageMock());
