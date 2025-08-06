import { Request, Response, NextFunction } from 'express';
import { ActivityLog, Product } from '../models';
import { NotFoundError, ForbiddenError } from '../utils/errorUtils';

/**
 * Log user activity (view, wishlist, cart)
 * @route POST /api/activities
 * @access Private
 */
export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const { productId, activityType } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Create activity log
    await ActivityLog.create({
      user: req.user.id,
      product: productId,
      activityType,
      timestamp: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular products based on views
 * @route GET /api/activities/popular
 * @access Public
 */
export const getPopularProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 8;
    const days = Number(req.query.days) || 30; // Default to last 30 days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate to find most viewed products
    const popularProducts = await ActivityLog.aggregate([
      {
        $match: {
          activityType: 'view',
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    // Get product details
    const productIds = popularProducts.map((item) => item._id);
    const products = await Product.find({ _id: { $in: productIds } }).populate(
      'category',
      'name slug'
    );

    // Sort products in the same order as popularProducts
    const sortedProducts = productIds.map((id) =>
      products.find((product) => product._id && product._id.toString() === id.toString())
    );

    res.status(200).json({
      success: true,
      products: sortedProducts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get related products based on user history
 * @route GET /api/activity/recommendations
 * @access Private
 */
export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const limit = Number(req.query.limit) || 8;

    // Get user's recently viewed products
    const recentlyViewed = await ActivityLog.find({
      user: req.user.id,
      activityType: 'view',
    })
      .sort({ timestamp: -1 })
      .limit(10);

    const viewedProductIds = recentlyViewed.map((log) => log.product);

    // Get user's purchased products
    const purchased = await ActivityLog.find({
      user: req.user.id,
      activityType: 'purchase',
    });

    const purchasedProductIds = purchased.map((log) => log.product);

    // Find products in the same categories as viewed products
    const viewedProducts = await Product.find({
      _id: { $in: viewedProductIds },
    });

    const categoryIds = viewedProducts.map((product) => product.category);

    // Find related products in the same categories but not already viewed or purchased
    const recommendations = await Product.find({
      category: { $in: categoryIds },
      _id: {
        $nin: [...viewedProductIds, ...purchasedProductIds],
      },
    })
      .populate('category', 'name slug')
      .limit(limit);

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get frequently bought together products
 * @route GET /api/activities/frequently-bought-together/:productId
 * @access Public
 */
export const getFrequentlyBoughtTogether = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.productId;
    const limit = Number(req.query.limit) || 4;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Find users who purchased this product
    const purchaseLogs = await ActivityLog.find({
      product: productId,
      activityType: 'purchase',
    });

    const userIds = purchaseLogs.map((log) => log.user);

    // Find other products purchased by these users
    const otherPurchases = await ActivityLog.find({
      user: { $in: userIds },
      product: { $ne: productId },
      activityType: 'purchase',
    });

    // Count frequency of each product
    const productCounts: Record<string, number> = {};
    otherPurchases.forEach((log) => {
      const id = log.product.toString();
      productCounts[id] = (productCounts[id] || 0) + 1;
    });

    // Sort products by frequency
    const sortedProductIds = Object.keys(productCounts).sort(
      (a, b) => productCounts[b] - productCounts[a]
    );

    // Get top products
    const topProductIds = sortedProductIds.slice(0, limit);
    const frequentlyBoughtTogether = await Product.find({
      _id: { $in: topProductIds },
    }).populate('category', 'name slug');

    // Sort products in the same order as topProductIds
    const sortedProducts = topProductIds.map((id) =>
      frequentlyBoughtTogether.find((product) => product._id && product._id.toString() === id)
    );

    res.status(200).json({
      success: true,
      frequentlyBoughtTogether: sortedProducts.filter(Boolean), // Remove undefined values
    });
  } catch (error) {
    next(error);
  }
}; 