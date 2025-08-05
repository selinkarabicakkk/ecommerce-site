import { Request, Response, NextFunction } from 'express';
import { Review, Product } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errorUtils';

/**
 * Get all reviews
 * @route GET /api/reviews
 * @access Public
 */
export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter: Record<string, any> = {};

    // Filter by product
    if (req.query.product) {
      filter.product = req.query.product;
    }

    // Filter by approved status
    if (req.query.approved) {
      filter.isApproved = req.query.approved === 'true';
    } else {
      // By default, only show approved reviews to public
      if (!req.user || req.user.role !== 'admin') {
        filter.isApproved = true;
      }
    }

    const count = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews by product ID
 * @route GET /api/reviews/product/:productId
 * @access Public
 */
export const getReviewsByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Only show approved reviews to public
    const filter = {
      product: req.params.productId,
      isApproved: true,
    };

    const count = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new review
 * @route POST /api/reviews
 * @access Private
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const { product: productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (alreadyReviewed) {
      throw new BadRequestError('Product already reviewed');
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment,
      isApproved: false, // Reviews need admin approval
    });

    res.status(201).json({
      success: true,
      review,
      message: 'Review submitted and awaiting approval',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review
 * @route PUT /api/reviews/:id
 * @access Private
 */
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update this review');
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    // If user is updating their own review, reset approval status
    if (review.user.toString() === req.user.id && req.user.role !== 'admin') {
      review.isApproved = false;
    }

    // If admin is updating, they can set approval status
    if (req.user.role === 'admin' && req.body.isApproved !== undefined) {
      review.isApproved = req.body.isApproved;
    }

    const updatedReview = await review.save();

    res.status(200).json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 * @route DELETE /api/reviews/:id
 * @access Private
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this review');
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve review
 * @route PUT /api/reviews/:id/approve
 * @access Private/Admin
 */
export const approveReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized');
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    review.isApproved = true;
    const updatedReview = await review.save();

    res.status(200).json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
}; 