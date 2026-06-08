import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const activeFamilies = await prisma.user.count({ where: { role: 'family' } });
  const activeBusinesses = await prisma.business.count({ where: { status: 'approved' } });
  
  // En un caso real calcularíamos esto basándonos en suscripciones activas
  const monthlyRevenue = activeBusinesses * 15; 
  const totalUsers = await prisma.user.count();

  res.status(200).json({
    totalUsers,
    activeFamilies,
    activeBusinesses,
    monthlyRevenue,
  });
});

export const getPendingBusinesses = asyncHandler(async (req, res) => {
  const pending = await prisma.business.findMany({
    where: { status: 'pending' },
    include: { user: true }
  });

  // Mapeamos para que coincida con lo que el frontend espera
  const formattedPending = pending.map(b => ({
    id: b.id,
    name: b.name,
    email: b.user?.email || 'sin-email@demo.com',
    requestDate: new Date().toISOString().split('T')[0], // Aproximación
  }));

  res.status(200).json(formattedPending);
});

export const approveBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const business = await prisma.business.update({
    where: { id: parseInt(id, 10) },
    data: { status: 'approved' }
  });

  res.status(200).json({ success: true, business });
});

export const rejectBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const business = await prisma.business.update({
    where: { id: parseInt(id, 10) },
    data: { status: 'rejected' }
  });

  res.status(200).json({ success: true, business });
});
