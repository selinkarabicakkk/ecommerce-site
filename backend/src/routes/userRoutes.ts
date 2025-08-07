import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateFavoriteCategories,
  getUserAddresses,
  getUserOrders,
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

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Kullanıcı hesap işlemleri
 */

// All routes are protected
router.use(protect);

// User profile routes
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Kullanıcı profil bilgilerini getir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/profile', getUserProfile);
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Kullanıcı profilini güncelle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Güncellendi
 */
router.put('/profile', validate(updateProfileSchema), updateUserProfile);

// Address routes
/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     summary: Adres listesini getir
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/addresses', getUserAddresses);
/**
 * @swagger
 * /api/users/addresses:
 *   post:
 *     summary: Yeni adres ekle
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
 *               - type
 *               - street
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [shipping, billing]
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Oluşturuldu
 */
router.post('/addresses', validate(addressSchema), addUserAddress);
/**
 * @swagger
 * /api/users/addresses/{id}:
 *   put:
 *     summary: Adresi güncelle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Güncellendi
 */
router.put('/addresses/:addressId', validate(updateAddressSchema), updateUserAddress);
/**
 * @swagger
 * /api/users/addresses/{id}:
 *   delete:
 *     summary: Adresi sil
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
 *         description: Silindi
 */
router.delete('/addresses/:addressId', deleteUserAddress);

// Favorite categories routes
/**
 * @swagger
 * /api/users/favorite-categories:
 *   put:
 *     summary: Favori kategorileri güncelle
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Güncellendi
 */
router.put('/favorite-categories', validate(favoritesCategoriesSchema), updateFavoriteCategories);

// Orders (for current user)
/**
 * @swagger
 * /api/users/orders:
 *   get:
 *     summary: Kullanıcının geçmiş siparişleri
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/orders', getUserOrders);

export default router; 