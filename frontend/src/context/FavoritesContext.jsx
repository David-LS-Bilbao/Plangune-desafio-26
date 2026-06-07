import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  fetchFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
} from "../services/favoritesApi";
import { eventsToPlans } from "../mappers/eventMapper";

/**
 * Estado global de favoritos para el área de familias.
 *
 * Fuente única: GET /api/favorites (PostgreSQL vía Express). Se carga una vez al montar
 * el provider, de modo que un F5 NO borra los favoritos (persistencia real en backend).
 * `toggleFavorite` es optimista con rollback si la llamada falla.
 *
 * Sin auth: el backend usa un usuario family mock fijo. No hay gate de login en el cliente.
 */
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [events, setEvents] = useState([]); // eventos favoritos crudos (shape backend)
  const [ids, setIds] = useState(() => new Set()); // ids favoritos (enteros)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchFavorites();
      setEvents(data);
      setIds(new Set(data.map((e) => e.id)));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isFavorite = useCallback((id) => ids.has(Number(id)), [ids]);

  const toggleFavorite = useCallback(
    async (id) => {
      const eventId = Number(id);
      if (Number.isNaN(eventId)) return;

      const wasFavorite = ids.has(eventId);

      // Actualización optimista del set de ids (respuesta inmediata del corazón).
      setIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(eventId);
        else next.add(eventId);
        return next;
      });

      try {
        if (wasFavorite) {
          await apiRemoveFavorite(eventId);
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
        } else {
          await apiAddFavorite(eventId);
          // Recargamos para incorporar el evento completo a la lista de /favoritos.
          await load();
        }
      } catch {
        // Rollback del set si la llamada falló.
        setIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(eventId);
          else next.delete(eventId);
          return next;
        });
      }
    },
    [ids, load],
  );

  const value = {
    favoritePlans: eventsToPlans(events),
    favoriteIds: ids,
    isFavorite,
    toggleFavorite,
    loading,
    error,
    refresh: load,
  };

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

/**
 * Hook de acceso a favoritos. Si se usa fuera del provider devuelve un stub seguro
 * (no-op) para no romper componentes renderizados de forma aislada (p. ej. en tests).
 */
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    return {
      favoritePlans: [],
      favoriteIds: new Set(),
      isFavorite: () => false,
      toggleFavorite: () => {},
      loading: false,
      error: false,
      refresh: () => {},
    };
  }
  return ctx;
}

export default FavoritesContext;
