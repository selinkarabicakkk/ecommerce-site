import express from 'express';
import {
  logActivity,
  getPopularProducts,
  getRecommendations,
  getFrequentlyBoughtTogether,
} from '../controllers/activityLogController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { logActivitySchema } from '../validations/activityValidation';

const router = express.Router();

// Public routes
router.get('/popular', getPopularProducts);
router.get('/frequently-bought-together/:productId', getFrequentlyBoughtTogether);

// Protected routes
router.post('/', protect, validate(logActivitySchema), logActivity);
router.get('/recommendations', protect, getRecommendations);

export default router; 