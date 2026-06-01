import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import BusinessLayout from '../components/layout/BusinessLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import PlansList from '../pages/PlansList';
import PlanDetail from '../pages/PlanDetail';
import FamilyProfile from '../pages/FamilyProfile';
import BusinessDashboard from '../pages/BusinessDashboard';
import BusinessOverview from '../pages/BusinessOverview';
import BusinessPerformance from '../pages/BusinessPerformance';
import CreateOffer from '../pages/CreateOffer';
import ManageOffers from '../pages/ManageOffers';
import AdminDashboard from '../pages/AdminDashboard';
import AdminData from '../pages/AdminData';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Family Area (Main Layout) */}
      <Route element={<MainLayout />}>
        <Route path="/planes" element={<PlansList />} />
        <Route path="/planes/:id" element={<PlanDetail />} />
        <Route path="/perfil" element={<FamilyProfile />} />
      </Route>
      
      {/* Business Area (Business Layout) */}
      <Route element={<BusinessLayout />}>
        <Route path="/negocio" element={<BusinessDashboard />} />
        <Route path="/negocio/dashboard" element={<BusinessOverview />} />
        <Route path="/negocio/rendimiento" element={<BusinessPerformance />} />
        <Route path="/negocio/crear-oferta" element={<CreateOffer />} />
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
