import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from '../controllers/categoryController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validations/categoryValidation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Kategori listeleme ve yönetimi
 */

// Public routes
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Tüm kategorileri getir
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug); // Note: This route must be before /:id to avoid slug being treated as id
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Kategori detayını getir
 *     tags: [Categories]
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
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/categories/{id}/products:
 *   get:
 *     summary: Bu kategoriye ait ürünleri getir
 *     tags: [Categories]
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
router.get('/:id/products', getCategoryProducts);

// Admin routes
router.post(
  '/',
  protect,
  restrictTo(['admin']),
  validate(createCategorySchema),
  createCategory
);
router.put(
  '/:id',
  protect,
  restrictTo(['admin']),
  validate(updateCategorySchema),
  updateCategory
);
router.delete('/:id', protect, restrictTo(['admin']), deleteCategory);

/**
 * ADMIN aliases under /api/admin/categories
 */
const adminCategories = express.Router();
/**
 * @swagger
 * tags:
 *   name: AdminCategories
 *   description: Admin kategori yönetimi
 */
adminCategories.post('/', protect, restrictTo(['admin']), validate(createCategorySchema), createCategory);
adminCategories.put('/:id', protect, restrictTo(['admin']), validate(updateCategorySchema), updateCategory);
adminCategories.delete('/:id', protect, restrictTo(['admin']), deleteCategory);
/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Kategori oluştur (Admin)
 *     tags: [AdminCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Oluşturuldu
 */
/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Kategori güncelle (Admin)
 *     tags: [AdminCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Kategori sil (Admin)
 *     tags: [AdminCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */

export const adminCategoriesRouter = adminCategories;

export default router; 