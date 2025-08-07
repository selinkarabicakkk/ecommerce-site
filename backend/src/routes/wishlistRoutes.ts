import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { wishlistValidation } from '../validations/wishlistValidation';
import * as wishlistController from '../controllers/wishlistController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Kullanıcı hesap işlemleri
 */

// Tüm rotalar için authentication gerekli
router.use(protect);

// GET /api/wishlist - Kullanıcının istek listesini getir
/**
 * @swagger
 * /api/user/wishlist:
 *   get:
 *     summary: Favori ürünleri getir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist - Ürünü istek listesine ekle
/**
 * @swagger
 * /api/user/wishlist:
 *   post:
 *     summary: Favorilere ürün ekle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Eklendi
 */
router.post('/', validate(wishlistValidation.addToWishlist), wishlistController.addToWishlist);

// DELETE /api/wishlist/:id - Ürünü istek listesinden çıkar
/**
 * @swagger
 * /api/user/wishlist/{id}:
 *   delete:
 *     summary: Favorilerden ürünü kaldır
 *     tags: [User]
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
 *         description: Kaldırıldı
 */
router.delete('/:id', wishlistController.removeFromWishlist);

// GET /api/wishlist/check/:productId - Ürünün istek listesinde olup olmadığını kontrol et
/**
 * @swagger
 * /api/user/wishlist/check/{productId}:
 *   get:
 *     summary: Ürün favorilerde mi?
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
router.get('/check/:productId', wishlistController.checkInWishlist);

// DELETE /api/wishlist - İstek listesini temizle
/**
 * @swagger
 * /api/user/wishlist:
 *   delete:
 *     summary: Tüm favorileri temizle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Temizlendi
 */
router.delete('/', wishlistController.clearWishlist);

// POST /api/wishlist/:productId - Toggle wishlist
/**
 * @swagger
 * /api/user/wishlist/{productId}:
 *   post:
 *     summary: Favorilere ekle/kaldır (toggle)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Güncellendi
 */
router.post('/:productId', wishlistController.toggleWishlistItem);

export default router;