import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  getPopularProducts,
  getRecommendations,
  getFrequentlyBoughtTogether,
} from '../controllers/activityLogController';
import { getRelatedProducts } from '../controllers/productController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Öneri uç noktaları (popüler, ilgili, geçmiş, birlikte alınanlar)
 */

/**
 * @swagger
 * /api/recommendations/popular:
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
 * /api/recommendations/related/{productId}:
 *   get:
 *     summary: İlgili ürünleri getir
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/related/:productId', (req, res, next) => {
  (req.params as any).id = req.params.productId;
  return getRelatedProducts(req, res, next);
});

/**
 * @swagger
 * /api/recommendations/history:
 *   get:
 *     summary: Kullanıcı geçmişine göre öneriler
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/history', protect, getRecommendations);

/**
 * @swagger
 * /api/recommendations/frequently-bought-together/{productId}:
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

export default router;


