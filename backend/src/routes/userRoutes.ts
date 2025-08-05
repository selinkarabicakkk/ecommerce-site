import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateFavoriteCategories,
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  favoritesCategoriesSchema,
} from '../validations/userValidation';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', validate(updateProfileSchema), updateUserProfile);

// Address routes
router.post('/addresses', validate(addressSchema), addUserAddress);
router.put('/addresses/:addressId', validate(updateAddressSchema), updateUserAddress);
router.delete('/addresses/:addressId', deleteUserAddress);

// Favorite categories routes
router.put('/favorite-categories', validate(favoritesCategoriesSchema), updateFavoriteCategories);

export default router; 