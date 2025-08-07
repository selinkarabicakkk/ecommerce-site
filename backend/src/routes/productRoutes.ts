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
  bulkUpdateProducts,
} from '../controllers/productController';
import { getReviewsByProduct } from '../controllers/reviewController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  createProductSchema,
  updateProductSchema,
  bulkUpdateProductsSchema,
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

/**
 * ADMIN aliases under /api/admin/products
 * Mirrors admin product routes for admin panel convenience
 */
const adminRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: AdminProducts
 *   description: Admin ürün yönetimi
 */
adminRouter.post('/', protect, restrictTo(['admin']), validate(createProductSchema), createProduct);
adminRouter.put('/:id', protect, restrictTo(['admin']), validate(updateProductSchema), updateProduct);
adminRouter.delete('/:id', protect, restrictTo(['admin']), deleteProduct);
adminRouter.patch('/bulk', protect, restrictTo(['admin']), validate(bulkUpdateProductsSchema), bulkUpdateProducts);
/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Yeni ürün ekle (Admin)
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Oluşturuldu
 */
/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Ürün güncelle (Admin)
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Ürünü sil (Admin)
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */

/**
 * @swagger
 * /api/admin/products/bulk:
 *   patch:
 *     summary: Çoklu ürünleri güncelle (aktif/pasif)
 *     tags: [AdminProducts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     isActive: { type: boolean }
 *                     isFeatured: { type: boolean }
 *     responses:
 *       200:
 *         description: Güncellendi
 */

// Mount admin alias under /api/admin/products
// This router will be mounted in index.ts along with /api/products
export const adminProductsRouter = adminRouter;

export default router; 