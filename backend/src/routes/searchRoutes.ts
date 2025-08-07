import express from 'express';
import { searchProducts } from '../controllers/searchController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Ürün arama
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Ürün arama
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating, newest]
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/', searchProducts);

export default router;


