import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
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

export default router; 