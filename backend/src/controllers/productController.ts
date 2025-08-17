import { Request, Response, NextFunction } from 'express';
import { Product, Category, ActivityLog } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errorUtils';
import { deleteFile } from '../utils/uploadUtils';

/**
 * Get all products with filtering, sorting, and pagination
 * @route GET /api/products
 * @access Public
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword as string,
            $options: 'i',
          },
        }
      : {};

    // Build filter object
    const filter: Record<string, any> = { ...keyword };

    // Category filter
    if (req.query.category) {
      // Check if category exists
      const category = await Category.findOne({
        $or: [
          { _id: req.query.category },
          { slug: req.query.category },
        ],
      });

      if (category) {
        filter.category = category._id;
      }
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Rating filter
    if (req.query.rating) {
      filter.averageRating = { $gte: Number(req.query.rating) };
    }

    // Featured products filter
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Sort options
    let sortOption = {};
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
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      // Default sort by newest
      sortOption = { createdAt: -1 };
    }

    // Only active products for public listing
    filter.isActive = filter.isActive ?? true;

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

/**
 * Get single product by ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name slug'
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by slug
 * @route GET /api/products/slug/:slug
 * @access Public
 */
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      'category',
      'name slug'
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 * @route POST /api/products
 * @access Private/Admin
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      specifications,
      tags,
      isFeatured,
      variants,
      stock,
      sku,
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new BadRequestError('Invalid category');
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if product with same slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      throw new BadRequestError('Product with this name already exists');
    }

    // Check if SKU already exists
    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      throw new BadRequestError('Product with this SKU already exists');
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      specifications: specifications || {},
      tags: tags || [],
      isFeatured: isFeatured || false,
      slug,
      variants: variants || [],
      stock,
      sku,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      specifications,
      tags,
      isFeatured,
      variants,
      stock,
      sku,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // If category is changing, check if new category exists
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        throw new BadRequestError('Invalid category');
      }
    }

    // If name is changing, generate new slug and check for duplicates
    if (name && name !== product.name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existingProduct = await Product.findOne({
        slug,
        _id: { $ne: req.params.id },
      });

      if (existingProduct) {
        throw new BadRequestError('Product with this name already exists');
      }

      product.name = name;
      product.slug = slug;
    }

    // If SKU is changing, check for duplicates
    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({
        sku,
        _id: { $ne: req.params.id },
      });

      if (skuExists) {
        throw new BadRequestError('Product with this SKU already exists');
      }

      product.sku = sku;
    }

    // Update other fields if provided
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (images) product.images = images;
    if (specifications) product.specifications = specifications;
    if (tags) product.tags = tags;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if ((req.body as any).isActive !== undefined) product.isActive = (req.body as any).isActive;
    if (variants) product.variants = variants;
    if (stock !== undefined) product.stock = stock;

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Delete product images
    for (const image of product.images) {
      // Extract filename from URL or path
      const filename = image.split('/').pop();
      if (filename) {
        await deleteFile(filename);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update products (active/featured)
 * @route PATCH /api/admin/products/bulk
 * @access Private/Admin
 */
export const bulkUpdateProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body as { items: Array<{ id: string; isActive?: boolean; isFeatured?: boolean; category?: string }> };
    if (!items || items.length === 0) {
      throw new BadRequestError('No items provided');
    }

    const bulkOps = items.map((it) => ({
      updateOne: {
        filter: { _id: it.id },
        update: {
          ...(it.isActive !== undefined ? { isActive: it.isActive } : {}),
          ...(it.isFeatured !== undefined ? { isFeatured: it.isFeatured } : {}),
          ...(it.category ? { category: it.category } : {}),
        },
      },
    }));

    const result = await Product.bulkWrite(bulkOps);
    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top rated products
 * @route GET /api/products/top
 * @access Public
 */
export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    const products = await Product.find({})
      .sort({ averageRating: -1 })
      .limit(limit)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * @route GET /api/products/featured
 * @access Public
 */
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const products = await Product.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get new arrivals
 * @route GET /api/products/new
 * @access Public
 */
export const getNewArrivals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get related products
 * @route GET /api/products/:id/related
 * @access Public
 */
export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    const limit = Number(req.query.limit) || 4;
    
    // Find products in the same category but exclude the current product
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(limit)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      products: relatedProducts,
    });
  } catch (error) {
    next(error);
  }
}; 

/**
 * Get popular products based on recent views/purchases
 * @route GET /api/products/popular
 * @access Public
 */
export const getPopularProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 8;
    const days = Number(req.query.days) || 30;

    // Date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate activity logs for views and purchases
    const popular = await ActivityLog.aggregate([
      {
        $match: {
          activityType: { $in: ['view', 'purchase'] },
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$product',
          score: { $sum: 1 },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);

    const ids = popular.map((p) => p._id);
    const products = await Product.find({ _id: { $in: ids } })
      .populate('category', 'name slug')
      .lean();

    // Keep original aggregated order
    const ordered = ids.map((id) => products.find((p) => p && p._id && p._id.toString() === id.toString()));

    res.status(200).json({ success: true, products: ordered.filter(Boolean) });
  } catch (error) {
    next(error);
  }
};