import express from 'express';
import { upload } from '../utils/uploadUtils';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Dosya yükleme
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Ürün resmi yükleme
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Yüklendi
 */
router.post('/', protect, restrictTo(['admin']), upload.single('image'), (req, res) => {
  res.json({ success: true, filename: (req.file as any)?.filename, path: `/images/${(req.file as any)?.filename}` });
});

export default router;


