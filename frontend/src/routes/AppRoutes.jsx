import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import BusinessLayout from "../components/layout/BusinessLayout";
import AdminLayout from "../components/layout/AdminLayout";
import PublicLayout from "../components/layout/PublicLayout";

// Guard de rutas por autenticación + rol
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";
import PlansList from "../pages/PlansList";
import PlanDetail from "../pages/PlanDetail";
import FamilyProfile from "../pages/FamilyProfile";
import Favorites from "../pages/Favorites";
import CreateFamily from "../pages/CreateFamily";
import OffersUser from "../pages/OffersUser";
import PlansSearch from "../pages/PlansSearch";
import CreateBusiness from "../pages/CreateBusiness";
import BusinessDashboard from "../pages/BusinessDashboard";
import BusinessOverview from "../pages/BusinessOverview";
import BusinessPerformance from "../pages/BusinessPerformance";
import BusinessReviews from "../pages/BusinessReviews";
import BusinessProfile from "../pages/BusinessProfile";
import BusinessStrategy from "../pages/BusinessStrategy";
import BusinessSubscriptions from "../pages/BusinessSubscriptions";
import ManageOffers from "../pages/ManageOffers";
import AdminDashboard from "../pages/AdminDashboard";
import AdminData from "../pages/AdminData";

// Feature visual aislada (playground del chat familiar con GUNI)
import FamilyChatPlayground from "../features/family-chat-playground";

/**
 * Mapa de rutas con guards por rol.
 *
 * PÚBLICAS (sin login): /, /login, /register, /no-autorizado, /crear-familia, /crear-negocio,
 *   /ofertas (ofertas para el consumidor) y /negocio/ofertas (excepción de producto: el panel
 *   de ofertas de negocio es visible sin login en esta fase; es demo, sin datos reales).
 *
 * FAMILIA (login + rol family): /planes, /planes/:id, /favoritos, /perfil, /buscar (+ GUNI dev).
 * NEGOCIO (login + rol business o admin): /negocio y subrutas, EXCEPTO /negocio/ofertas (pública).
 * ADMIN (login + rol admin): /admin, /admin/data.
 *
 * El admin puede entrar también en el área de negocio (allow incluye 'admin'); no entra en el
 * flujo de familia. Usuario sin login → /login; con login pero rol insuficiente → /no-autorizado.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* ── PÚBLICAS ──────────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/no-autorizado" element={<Unauthorized />} />

      {/* Registro detallado (onboarding) — públicas */}
      <Route path="/crear-familia" element={<CreateFamily />} />
      <Route path="/crear-negocio" element={<CreateBusiness />} />

      {/* Ofertas para el consumidor — pública */}
      <Route element={<PublicLayout />}>
        <Route path="/ofertas" element={<OffersUser />} />
      </Route>

      {/* /negocio/ofertas — PÚBLICA (excepción del brief); mantiene chrome de negocio */}
      <Route element={<BusinessLayout />}>
        <Route path="/negocio/ofertas" element={<ManageOffers />} />
      </Route>

      {/* ── FAMILIA (login + rol family) ──────────────────────────── */}
      <Route element={<ProtectedRoute allow={["family"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/planes" element={<PlansList />} />
          <Route path="/planes/:id" element={<PlanDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/perfil" element={<FamilyProfile />} />
          <Route path="/buscar" element={<PlansSearch />} />
          {/* Ruta temporal de desarrollo: playground del chat con GUNI.
              Solo se registra en desarrollo; en build de producción se elimina. */}
          {import.meta.env.DEV && (
            <Route path="/dev/family-chat" element={<FamilyChatPlayground />} />
          )}
        </Route>
      </Route>

      {/* ── NEGOCIO (login + rol business o admin) ────────────────── */}
      <Route element={<ProtectedRoute allow={["business", "admin"]} />}>
        <Route element={<BusinessLayout />}>
          <Route path="/negocio" element={<BusinessDashboard />} />
          <Route path="/negocio/dashboard" element={<BusinessOverview />} />
          <Route path="/negocio/perfil" element={<BusinessProfile />} />
          <Route path="/negocio/rendimiento" element={<BusinessPerformance />} />
          <Route path="/negocio/resenas" element={<BusinessReviews />} />
          <Route path="/negocio/suscripciones" element={<BusinessSubscriptions />} />
          <Route path="/negocio/estrategia" element={<BusinessStrategy />} />
        </Route>
      </Route>

      {/* ── ADMIN (login + rol admin) ─────────────────────────────── */}
      <Route element={<ProtectedRoute allow={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/data" element={<AdminData />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
