import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getApprovedActivities,
  getApprovedActivityById,
} from '../services/activity.service.js';

/** GET /api/activities — lista de actividades aprobadas. */
export const listActivities = asyncHandler(async (req, res) => {
  res.status(200).json(getApprovedActivities());
});

/** GET /api/activities/:id — detalle de una actividad aprobada. */
export const getActivity = asyncHandler(async (req, res) => {
  const activity = getApprovedActivityById(req.params.id);

  if (!activity) {
    const error = new Error('Actividad no encontrada');
    error.status = 404;
    throw error;
  }

  res.status(200).json(activity);
});
