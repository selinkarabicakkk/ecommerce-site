import express from 'express';
import { logActivity } from '../controllers/activityLogController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { logActivitySchema } from '../validations/activityValidation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Kullanıcı aktivitesi kaydı
 */

// No public recommendation endpoints under /activities anymore

// Protected routes
/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Kullanıcı aktivitesi kaydet (view, wishlist, purchase)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, activityType]
 *             properties:
 *               productId: { type: string }
 *               activityType: { type: string, enum: [view, wishlist, purchase] }
 *     responses:
 *       201:
 *         description: Oluşturuldu
 */
router.post('/', protect, validate(logActivitySchema), logActivity);
// No recommendations under /activities; use /api/recommendations instead

export default router; 