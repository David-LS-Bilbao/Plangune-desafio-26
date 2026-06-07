import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import { useAuthStore } from './store';

function App() {
  // Valida la sesión (cookie httpOnly) una sola vez al arrancar: GET /api/auth/me.
  // Mientras tanto, los guards muestran un estado de carga.
  useEffect(() => {
    useAuthStore.getState().checkSession();
  }, []);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

export default App;
