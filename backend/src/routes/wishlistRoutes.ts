import express from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { wishlistValidation } from '../validations/wishlistValidation';
import * as wishlistController from '../controllers/wishlistController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Kullanıcı istek listesi işlemleri
 */

// Tüm rotalar için authentication gerekli
router.use(protect);

// GET /api/wishlist - Kullanıcının istek listesini getir
/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Favori ürünleri getir
 *     tags: [Wishlist]
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
 * /api/wishlist:
 *   post:
 *     summary: Favorilere ürün ekle
 *     tags: [Wishlist]
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
 * /api/wishlist/{id}:
 *   delete:
 *     summary: Favorilerden ürünü kaldır
 *     tags: [Wishlist]
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
 * /api/wishlist/check/{productId}:
 *   get:
 *     summary: Ürün favorilerde mi?
 *     tags: [Wishlist]
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
 * /api/wishlist:
 *   delete:
 *     summary: Tüm favorileri temizle
 *     tags: [Wishlist]
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
 * /api/wishlist/{productId}:
 *   post:
 *     summary: Favorilere ekle/kaldır (toggle)
 *     tags: [Wishlist]
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