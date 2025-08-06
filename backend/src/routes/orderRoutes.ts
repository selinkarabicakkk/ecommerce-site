import express from 'express';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
} from '../controllers/orderController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  createOrderSchema,
  updateOrderToPaidSchema,
  updateOrderStatusSchema,
} from '../validations/orderValidation';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.post('/', validate(createOrderSchema), createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/pay', validate(updateOrderToPaidSchema), updateOrderToPaid);

// Admin routes
router.get('/', restrictTo(['admin']), getOrders);
router.put(
  '/:id/status',
  restrictTo(['admin']),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router; 