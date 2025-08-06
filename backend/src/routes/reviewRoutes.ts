import express from 'express';
import {
  getReviews,
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
} from '../controllers/reviewController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  createReviewSchema,
  updateReviewSchema,
} from '../validations/reviewValidation';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/product/:productId', getReviewsByProduct);

// Protected routes
router.post('/', protect, validate(createReviewSchema), createReview);
router.put('/:id', protect, validate(updateReviewSchema), updateReview);
router.delete('/:id', protect, deleteReview);

// Admin routes
router.put(
  '/:id/approve',
  protect,
  restrictTo(['admin']),
  approveReview
);

export default router; 