import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import BusinessLayout from "../components/layout/BusinessLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Family Area (Main Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/planes" element={<PlansList />} />
        <Route path="/planes/:id" element={<PlanDetail />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/perfil" element={<FamilyProfile />} />
        <Route path="/ofertas" element={<OffersUser />} />
        <Route path="/buscar" element={<PlansSearch />} />
      </Route>

      {/* Registration / Account Creation */}
      <Route path="/crear-familia" element={<CreateFamily />} />
      <Route path="/crear-negocio" element={<CreateBusiness />} />

      {/* Business Area (Business Layout) */}
      <Route element={<BusinessLayout />}>
        <Route path="/negocio" element={<BusinessDashboard />} />
        <Route path="/negocio/dashboard" element={<BusinessOverview />} />
        <Route path="/negocio/perfil" element={<BusinessProfile />} />
        <Route path="/negocio/rendimiento" element={<BusinessPerformance />} />
        <Route path="/negocio/resenas" element={<BusinessReviews />} />
        <Route
          path="/negocio/suscripciones"
          element={<BusinessSubscriptions />}
        />
        <Route path="/negocio/estrategia" element={<BusinessStrategy />} />
        <Route path="/negocio/ofertas" element={<ManageOffers />} />
      </Route>

      {/* Admin Area (Admin Layout) */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/data" element={<AdminData />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
