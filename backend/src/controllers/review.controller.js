import { asyncHandler } from '../utils/asyncHandler.js';
import { createReview } from '../services/review.service.js';

/** POST /api/reviews — crea una reseña (entra como `pending`). */
export const createReviewHandler = asyncHandler(async (req, res) => {
  const { activityId, rating, comment } = req.body;
  const review = createReview({ activityId, rating, comment });
  res.status(201).json(review);
});
