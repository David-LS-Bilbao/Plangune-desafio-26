import { create } from "zustand";
import { mockPlans } from "../mocks/data";
import {
  login as apiLogin,
  register as apiRegister,
  fetchMe as apiFetchMe,
  logout as apiLogout,
} from "../services/authApi";

// --- AUTH STORE (login real con JWT en cookie httpOnly) ---
//
// El token vive en una cookie httpOnly (no accesible por JS). En el store solo guardamos el
// `user`. `status` controla los guards: 'loading' mientras se valida la sesión (GET /auth/me),
// luego 'authenticated' o 'guest'. La cookie es la fuente de verdad; cacheamos el user en
// localStorage solo para evitar parpadeos de UI en recargas.

const USER_CACHE_KEY = "auth_user";

function readCachedUser() {
  try { return JSON.parse(localStorage.getItem(USER_CACHE_KEY)); } catch { return null; }
}

function cacheUser(user) {
  if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_CACHE_KEY);
}

/**
 * Enriquece el user del backend ({ id, email, role }) con `name`/`avatar` derivados del email,
 * que la UI (navbar, perfil) ya espera. No añade datos sensibles ni los persiste en backend.
 */
function decorateUser(user) {
  if (!user) return null;
  const localPart = (user.email || "").split("@")[0] || "cuenta";
  const name = user.name || localPart.charAt(0).toUpperCase() + localPart.slice(1);
  const avatar = user.avatar || localPart.slice(0, 2).toUpperCase();
  return { ...user, name, avatar };
}

export const useAuthStore = create((set) => ({
  // Hidratamos el user cacheado para pintar la navbar al instante; status sigue en 'loading'
  // hasta que checkSession() valide la cookie contra el backend.
  user: decorateUser(readCachedUser()),
  status: "loading", // 'loading' | 'authenticated' | 'guest'

  /** Valida la sesión actual contra el backend (GET /auth/me). Se llama una vez al arrancar. */
  checkSession: async () => {
    try {
      const user = decorateUser(await apiFetchMe());
      cacheUser(user);
      set({ user, status: "authenticated" });
      return user;
    } catch {
      cacheUser(null);
      set({ user: null, status: "guest" });
      return null;
    }
  },

  /** Login real (email + password). Lanza si las credenciales fallan. */
  login: async (email, password) => {
    const user = decorateUser(await apiLogin(email, password));
    cacheUser(user);
    set({ user, status: "authenticated" });
    return user;
  },

  /** Registro real (family/business). Inicia sesión al crear la cuenta. */
  register: async (payload) => {
    const user = decorateUser(await apiRegister(payload));
    cacheUser(user);
    set({ user, status: "authenticated" });
    return user;
  },

  /** Actualiza campos del usuario en cliente (avatar, preferencias). No persiste en backend. */
  updateUser: (partial) =>
    set((state) => {
      const user = { ...state.user, ...partial };
      cacheUser(user);
      return { user };
    }),

  /** Cierra sesión (borra la cookie en backend) y limpia el estado local. */
  logout: async () => {
    try { await apiLogout(); } catch { /* la limpieza local procede igualmente */ }
    cacheUser(null);
    set({ user: null, status: "guest" });
  },
}));

// --- USER STORE (Family: Favorites, Profile, Reservations) ---
export const useUserStore = create((set, get) => ({
  favorites: [],
  reservations: [],
  children: [
    { id: 1, name: "Ibai", age: 5 },
    { id: 2, name: "Ane", age: 8 },
  ],
  toggleFavorite: (planId) => {
    const { favorites } = get();
    if (favorites.includes(planId)) {
      set({ favorites: favorites.filter((id) => id !== planId) });
    } else {
      set({ favorites: [...favorites, planId] });
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
  addOffer: (offer) => set({ offers: [...get().offers, { status: 'pending', ...offer, id: Date.now() }] }),
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
