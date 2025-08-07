import { Request, Response, NextFunction } from 'express';
import { Product, Category } from '../models';

/**
 * Search products
 * @route GET /api/search
 * @access Public
 */
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const q = (req.query.q as string) || (req.query.keyword as string) || '';

    const keyword = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
          ],
        }
      : {};

    const filter: Record<string, any> = { ...keyword };

    // Optional category filter (id or slug)
    if (req.query.category) {
      const category = await Category.findOne({
        $or: [{ _id: req.query.category }, { slug: req.query.category }],
      });
      if (category) {
        filter.category = category._id;
      }
    }

    // Price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 } as Record<string, 1 | -1>;
    const sortBy = req.query.sortBy as string;
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { averageRating: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
      }
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .populate('category', 'name slug')
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      products,
    });
  } catch (error) {
    next(error);
  }
};


