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

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Popüler, ilgili ve geçmişe dayalı öneriler
 */

// Public routes
/**
 * @swagger
 * /api/activities/popular:
 *   get:
 *     summary: Popüler ürünleri getir
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/popular', getPopularProducts);
/**
 * @swagger
 * /api/activities/frequently-bought-together/{productId}:
 *   get:
 *     summary: Sık birlikte alınanlar
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/frequently-bought-together/:productId', getFrequentlyBoughtTogether);

// Protected routes
/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Kullanıcı aktivitesi kaydet (view, wishlist, purchase)
 *     tags: [Recommendations]
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
/**
 * @swagger
 * /api/activities/recommended:
 *   get:
 *     summary: Kullanıcı geçmişine göre öneriler
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/recommended', protect, getRecommendations);

export default router; 