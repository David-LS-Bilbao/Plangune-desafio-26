import { mockActivities } from "../seed/mockActivities.js";

/**
 * Almacén en memoria de actividades (MVP). Se clona el seed para no mutar el original.
 * En una rama posterior, estas funciones se reimplementarán sobre Prisma/PostgreSQL
 * manteniendo la misma firma pública.
 */
const activities = mockActivities.map((a) => ({ ...a }));

/** Devuelve todas las actividades (cualquier estado). */
export function getAllActivities() {
  return activities;
}

/** Devuelve solo las actividades aprobadas (las públicas del contrato). */
export function getApprovedActivities() {
  return activities.filter((a) => a.status === "approved");
}

/** Busca una actividad por id (cualquier estado). `undefined` si no existe. */
export function getActivityById(id) {
  return activities.find((a) => a.id === id);
}

/** Busca una actividad aprobada por id. `undefined` si no existe o no está aprobada. */
export function getApprovedActivityById(id) {
  const activity = getActivityById(id);
  return activity?.status === "approved" ? activity : undefined;
}

/** `true` si existe una actividad con ese id (cualquier estado). */
export function activityExists(id) {
  return Boolean(getActivityById(id));
}
