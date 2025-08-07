import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getFeaturedProducts,
  getNewArrivals,
  getRelatedProducts,
  getPopularProducts,
} from '../controllers/productController';
import { getReviewsByProduct } from '../controllers/reviewController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validations/productValidation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Ürün listeleme ve yönetimi
 */

// Public routes
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri listele
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating, newest]
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/', getProducts);
router.get('/top', getTopProducts);
/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Öne çıkan ürünleri getir
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/featured', getFeaturedProducts);
/**
 * @swagger
 * /api/products/popular:
 *   get:
 *     summary: Popüler ürünleri getir (tıklama/satın alma bazlı)
 *     tags: [Products]
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
router.get('/new', getNewArrivals);
router.get('/slug/:slug', getProductBySlug); // Note: This route must be before /:id to avoid slug being treated as id
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Ürün detayını getir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/:id', getProductById);
/**
 * @swagger
 * /api/products/{id}/related:
 *   get:
 *     summary: Benzer ürünleri getir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/:id/related', getRelatedProducts);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     summary: Belirli ürünün yorumlarını getir
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/:id/reviews', (req, res, next) => {
  (req.params as any).productId = req.params.id;
  return getReviewsByProduct(req, res, next);
});

// Admin routes
router.post(
  '/',
  protect,
  restrictTo(['admin']),
  validate(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  protect,
  restrictTo(['admin']),
  validate(updateProductSchema),
  updateProduct
);
router.delete('/:id', protect, restrictTo(['admin']), deleteProduct);

export default router; 