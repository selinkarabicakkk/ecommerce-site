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
} from '../controllers/productController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validations/productValidation';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new', getNewArrivals);
router.get('/slug/:slug', getProductBySlug); // Note: This route must be before /:id to avoid slug being treated as id
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

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