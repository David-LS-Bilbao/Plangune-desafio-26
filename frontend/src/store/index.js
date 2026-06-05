import { create } from "zustand";
import { mockPlans, MOCK_USERS } from "../mocks/data";

// --- AUTH STORE ---
export const useAuthStore = create((set) => ({
  user: null, // null when not logged in
  login: (payload) => {
    if (typeof payload === "string") {
      set({ user: MOCK_USERS[payload] });
    } else {
      set({ user: payload });
    }
  },
  updateUser: (partial) =>
    set((state) => ({ user: { ...state.user, ...partial } })),
  logout: () => set({ user: null }),
}));

// --- USER STORE (Family: Favorites, Profile, Reservations) ---
export const useUserStore = create((set, get) => ({
  favorites: [],
  reservations: [],
  children: [
    { id: 1, name: "Ibai", age: 5 },
    { id: 2, name: "Ane", age: 8 },
  ],
  fetchFavorites: async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiUrl}/favorites`);
      if (response.ok) {
        const data = await response.json();
        const ids = data.map((fav) => fav.id);
        set({ favorites: ids });
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  },
  toggleFavorite: async (planId) => {
    const { favorites } = get();
    const isFav = favorites.includes(planId);
    
    // Optimistic update
    const nextFavorites = isFav
      ? favorites.filter((id) => id !== planId)
      : [...favorites, planId];
    
    set({ favorites: nextFavorites });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiUrl}/favorites/${planId}`, {
        method: isFav ? "DELETE" : "POST",
      });
      if (!response.ok) {
        // Rollback
        set({ favorites });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Rollback
      set({ favorites });
    }
  },
  isFavorite: (planId) => get().favorites.includes(planId),
  addReservation: (plan) => {
    set({ reservations: [...get().reservations, { ...plan, date: new Date().toISOString() }] });
  },
  addChild: (child) => set({ children: [...get().children, { ...child, id: Date.now() }] }),
  removeChild: (id) => set({ children: get().children.filter((c) => c.id !== id) }),
}));

// --- BUSINESS STORE (Offers, Subscription, Stats) ---
export const useBusinessStore = create((set, get) => ({
  offers: mockPlans.slice(0, 2).map((p) => ({ ...p, status: 'active' })), // mock some initial offers
  subscription: "Free", // Free, Pro, Premium
  stats: {
    views: 1240,
    clicks: 350,
    reservations: 42,
  },
  addOffer: (offer) => set({ offers: [...get().offers, { ...offer, id: Date.now(), status: 'active' }] }),
  updateOffer: (id, partial) => set({
    offers: get().offers.map((o) => (o.id === id ? { ...o, ...partial } : o)),
  }),
  deleteOffer: (id) => set({ offers: get().offers.filter((o) => o.id !== id) }),
  setSubscription: (plan) => set({ subscription: plan }),
}));

// --- ADMIN STORE (Users, Pending Businesses) ---
export const useAdminStore = create((set, get) => ({
  pendingBusinesses: [
    { id: 101, name: "Txikipark Aventuras", email: "info@txiki.com", requestDate: "2026-06-01" },
    { id: 102, name: "Taller Creativo Bilbao", email: "hola@taller.es", requestDate: "2026-06-02" },
  ],
  approvedBusinesses: [],
  approveBusiness: (id) => {
    const business = get().pendingBusinesses.find((b) => b.id === id);
    if (business) {
      set({
        pendingBusinesses: get().pendingBusinesses.filter((b) => b.id !== id),
        approvedBusinesses: [...get().approvedBusinesses, business],
      });
    }
  },
  rejectBusiness: (id) => {
    set({ pendingBusinesses: get().pendingBusinesses.filter((b) => b.id !== id) });
  },
  stats: {
    totalUsers: 1542,
    activeFamilies: 1200,
    activeBusinesses: 340,
    monthlyRevenue: 4500,
  }
}));

// --- PLANS STORE (Search, Filters, Data) ---
export const usePlansStore = create((set, get) => ({
  allPlans: mockPlans,
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiUrl}/events`);
      if (!response.ok) throw new Error("Error fetching plans");
      const data = await response.json();

      const mapped = data.map((event) => {
        let cat = event.categoria || "Otros";
        cat = cat.charAt(0).toUpperCase() + cat.slice(1);

        return {
          id: event.id,
          title: event.title,
          location: event.lugar || event.address || event.municipio || "",
          category: cat,
          price: event.price || "Gratis",
          rating: event.rating || 4.5,
          reviews: event.reviews || 0,
          distance: "A 2km de ti",
          ageRange: event.edad_minima !== null 
            ? (Number(event.edad_minima) === 0 ? "Todas las edades" : `${Math.floor(Number(event.edad_minima))}+ años`)
            : "Todas las edades",
          tags: [
            event.es_interior ? "Interior" : "Aire Libre",
            event.es_carrito ? "Apto Carrito" : null,
            event.es_cambiador ? "Cambiador" : null,
            event.es_silla_ruedas ? "Accesible" : null,
            event.es_mascotas ? "Mascotas" : null,
          ].filter(Boolean),
          isIdeal: event.multiplicador > 1,
          subscriptionTier: event.business_id ? (event.business_id === 1 ? "Premium" : "Pro") : "None",
          description: event.description || "",
          image: event.imagen_url || "https://images.unsplash.com/photo-1543325164-9ed3ebc18221?q=80&w=600&auto=format&fit=crop",
        };
      });

      set({ allPlans: mapped, loading: false });
    } catch (error) {
      console.warn("Backend API failed. Falling back to local mock plans:", error);
      set({ allPlans: mockPlans, loading: false, error: error.message });
    }
  },

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeCategory: "Todos",
  setActiveCategory: (category) => set({ activeCategory: category }),

  activeFilters: [],
  toggleFilter: (filter) => set((state) => ({
    activeFilters: state.activeFilters.includes(filter)
      ? state.activeFilters.filter(f => f !== filter)
      : [...state.activeFilters, filter]
  })),

  ageFilters: [],
  toggleAgeFilter: (age) => set((state) => ({
    ageFilters: state.ageFilters.includes(age)
      ? state.ageFilters.filter(a => a !== age)
      : [...state.ageFilters, age]
  })),

  // Derived state: get filtered and sorted plans
  getFilteredPlans: () => {
    const { allPlans, searchQuery, activeCategory, activeFilters, ageFilters } = get();
    let filtered = allPlans;

    if (activeCategory !== "Todos") {
      filtered = filtered.filter((plan) => plan.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(q) ||
          plan.location.toLowerCase().includes(q),
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter((plan) => 
        activeFilters.every(f => plan.tags && plan.tags.some(tag => tag.toLowerCase().includes(f.toLowerCase())))
      );
    }

    if (ageFilters.length > 0) {
      filtered = filtered.filter((plan) => {
        const ar = plan.ageRange || "";
        return ageFilters.some((age) => {
          if (ar === "Todas las edades") return true;
          if (age === "Bebé")     return ar.includes("0");
          if (age === "1-3 años") return ar.includes("1") || ar.includes("2") || ar.includes("3");
          if (age === "4-6 años") return ar.includes("4") || ar.includes("5") || ar.includes("6") || ar === "3+ años";
          return false;
        });
      });
    }

    // Sort by subscription tier (Premium > Pro > Base > None)
    const tierOrder = { 'Premium': 3, 'Pro': 2, 'Base': 1, 'None': 0 };
    filtered.sort((a, b) => (tierOrder[b.subscriptionTier] || 0) - (tierOrder[a.subscriptionTier] || 0));

    return filtered;
  },

  getPlanById: (id) => {
    return get().allPlans.find((p) => p.id === parseInt(id));
  },
}));
