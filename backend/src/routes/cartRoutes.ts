import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../validations/cartValidation';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.put('/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router; 