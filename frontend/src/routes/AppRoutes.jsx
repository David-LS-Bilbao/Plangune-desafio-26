import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import PlansList from '../pages/PlansList';
import PlanDetail from '../pages/PlanDetail';
import FamilyProfile from '../pages/FamilyProfile';
import BusinessDashboard from '../pages/BusinessDashboard';
import AdminDashboard from '../pages/AdminDashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/planes" element={<PlansList />} />
      <Route path="/planes/:id" element={<PlanDetail />} />
      <Route path="/perfil" element={<FamilyProfile />} />
      <Route path="/negocio" element={<BusinessDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default AppRoutes;
