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

// --- USER STORE (Favorites, Cart, etc.) ---
export const useUserStore = create((set, get) => ({
  favorites: [], // array of plan IDs
  toggleFavorite: (planId) => {
    const { favorites } = get();
    if (favorites.includes(planId)) {
      set({ favorites: favorites.filter((id) => id !== planId) });
    } else {
      set({ favorites: [...favorites, planId] });
    }
  },
  isFavorite: (planId) => get().favorites.includes(planId),
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
