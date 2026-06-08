import { asyncHandler } from '../utils/asyncHandler.js';
import { createReview, getAllReviews } from '../services/review.service.js';

/** POST /api/reviews — crea una reseña (entra como `pending`). */
export const createReviewHandler = asyncHandler(async (req, res) => {
  const { activityId, rating, comment } = req.body;
  const review = await createReview({ activityId, rating, comment, userId: req.user.id });
  res.status(201).json(review);
});

/** GET /api/reviews — obtiene reseñas (opcionalmente por eventId). */
export const getReviewsHandler = asyncHandler(async (req, res) => {
  const { eventId } = req.query;
  const reviews = await getAllReviews(eventId);
  res.status(200).json(reviews);
});
