import { Request, Response, NextFunction } from 'express';
import { Category } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errorUtils';

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category by ID
 * @route GET /api/categories/:id
 * @access Public
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 * @route GET /api/categories/slug/:slug
 * @access Public
 */
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 * @route POST /api/categories
 * @access Private/Admin
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image, sortOrder, isActive } = req.body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      throw new BadRequestError('Category with this name already exists');
    }

    const category = await Category.create({
      name,
      description,
      image,
      slug,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // If name is changing, generate new slug and check for duplicates
    if (name && name !== category.name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existingCategory = await Category.findOne({
        slug,
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        throw new BadRequestError('Category with this name already exists');
      }

      category.name = name;
      category.slug = slug;
    }

    if (description) category.description = description;
    if (image) category.image = image;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted',
    });
  } catch (error) {
    next(error);
  }
}; 