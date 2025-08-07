import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import { Order, User, Product } from '../models';

const router = express.Router();

// All admin routes require admin role
router.use(protect, restrictTo(['admin']));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin yönetim uç noktaları
 */

// Orders
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Tüm siparişleri getir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı
 */
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Sipariş detayını getir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    res.json({ success: true, order });
  } catch (e) { next(e); }
});

// Customers
/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Tüm müşterileri listele
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customers', async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   get:
 *     summary: Müşteri detayını getir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/customers/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

// Dashboard stats
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Satış, sipariş, müşteri istatistikleri
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [ordersCount, customersCount, revenueAgg] = await Promise.all([
      Order.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;
    res.json({ success: true, stats: { ordersCount, customersCount, revenue } });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/admin/popular-products:
 *   get:
 *     summary: En çok satılan ürünler
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/popular-products', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const agg = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $group: { _id: '$orderItems.product', sold: { $sum: '$orderItems.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ]);
    const ids = agg.map(a => a._id);
    const products = await Product.find({ _id: { $in: ids } }).select('name slug images price');
    const ordered = ids.map(id => products.find(p => p._id?.toString() === id.toString()));
    res.json({ success: true, products: ordered.filter(Boolean), meta: agg });
  } catch (e) { next(e); }
});

/**
 * @swagger
 * /api/admin/sales-graph:
 *   get:
 *     summary: Zaman bazlı satış grafikleri
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sales-graph', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const from = new Date();
    from.setDate(from.getDate() - days);
    const series = await Order.aggregate([
      { $match: { createdAt: { $gte: from }, isPaid: true } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, series });
  } catch (e) { next(e); }
});

export default router;


