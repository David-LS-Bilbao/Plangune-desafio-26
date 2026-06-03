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
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeCategory: "Todos",
  setActiveCategory: (category) => set({ activeCategory: category }),

  // Derived state: get filtered plans
  getFilteredPlans: () => {
    const { allPlans, searchQuery, activeCategory } = get();
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

    return filtered;
  },

  getPlanById: (id) => {
    return get().allPlans.find((p) => p.id === parseInt(id));
  },
}));
