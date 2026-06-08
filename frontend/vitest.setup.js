import '@testing-library/jest-dom';

window.scrollTo = () => {};

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
