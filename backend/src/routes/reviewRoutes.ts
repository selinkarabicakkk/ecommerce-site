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

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Ürün yorumları
 */

// Public routes
/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Yorumları listele (public: yalnızca onaylılar)
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *       - in: query
 *         name: approved
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/', getReviews);
/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Belirli ürünün yorumlarını getir
 *     tags: [Reviews]
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
router.get('/product/:productId', getReviewsByProduct);

// Protected routes
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Ürün için yorum yap
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product, rating, comment]
 *             properties:
 *               product: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Oluşturuldu
 */
router.post('/', protect, validate(createReviewSchema), createReview);
/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Yorumu güncelle (kullanıcıya aitse veya admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: number }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Güncellendi
 */
router.put('/:id', protect, validate(updateReviewSchema), updateReview);
/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Yorumu sil (kullanıcıya aitse veya admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Silindi
 */
router.delete('/:id', protect, deleteReview);

// Admin routes
/**
 * @swagger
 * /api/reviews/{id}/approve:
 *   patch:
 *     summary: Yorumu admin onaylar
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Onaylandı
 */
router.patch('/:id/approve', protect, restrictTo(['admin']), approveReview);

export default router; 