import { randomUUID } from 'node:crypto';

import { activityExists } from './activity.service.js';

/** Almacén en memoria de incidencias (MVP). Se reinicia al reiniciar el proceso. */
const incidents = [];

/**
 * Crea una incidencia en estado `open`.
 * Lanza un error 404 (con `.status`) si la actividad no existe.
 */
export function createIncident({ activityId, type, description }) {
  if (!activityExists(activityId)) {
    const error = new Error('Actividad no encontrada');
    error.status = 404;
    throw error;
  }

  const incident = {
    id: randomUUID(),
    activityId,
    type,
    description: description ?? null,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  incidents.push(incident);
  return incident;
}

/** Devuelve todas las incidencias (uso interno / futuro panel admin). */
export function getAllIncidents() {
  return incidents;
}
