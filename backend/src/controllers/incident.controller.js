import { asyncHandler } from '../utils/asyncHandler.js';
import { createIncident } from '../services/incident.service.js';

/** POST /api/incidents — reporta una incidencia (entra como `open`). */
export const createIncidentHandler = asyncHandler(async (req, res) => {
  const { activityId, type, description } = req.body;
  const incident = await createIncident({ activityId, type, description });
  res.status(201).json(incident);
});
