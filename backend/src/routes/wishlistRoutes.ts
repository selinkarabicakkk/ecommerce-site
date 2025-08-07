import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { wishlistValidation } from '../validations/wishlistValidation';
import * as wishlistController from '../controllers/wishlistController';

const router = express.Router();

// Tüm rotalar için authentication gerekli
router.use(protect);

// GET /api/wishlist - Kullanıcının istek listesini getir
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist - Ürünü istek listesine ekle
router.post('/', validate(wishlistValidation.addToWishlist), wishlistController.addToWishlist);

// DELETE /api/wishlist/:id - Ürünü istek listesinden çıkar
router.delete('/:id', wishlistController.removeFromWishlist);

// GET /api/wishlist/check/:productId - Ürünün istek listesinde olup olmadığını kontrol et
router.get('/check/:productId', wishlistController.checkInWishlist);

// DELETE /api/wishlist - İstek listesini temizle
router.delete('/', wishlistController.clearWishlist);

// POST /api/wishlist/:productId - Toggle wishlist
router.post('/:productId', wishlistController.toggleWishlistItem);

export default router;