import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import { usePlansStore, useUserStore } from './store';

function App() {
  const fetchPlans = usePlansStore((state) => state.fetchPlans);
  const fetchFavorites = useUserStore((state) => state.fetchFavorites);

  useEffect(() => {
    fetchPlans();
    fetchFavorites();
  }, [fetchPlans, fetchFavorites]);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

export default App;
