import { Request, Response, NextFunction } from 'express';
import { Cart, Product } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errorUtils';

/**
 * Get user's cart
 * @route GET /api/cart
 * @access Private
 */
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name price images stock slug',
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0,
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * @route POST /api/cart
 * @access Private
 */
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const { productId, quantity, variantOptions } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      throw new BadRequestError('Product is out of stock');
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        variantOptions: variantOptions || {},
      });
    }

    // Save cart
    await cart.save();

    // Populate product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock slug',
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item
 * @route PUT /api/cart/:itemId
 * @access Private
 */
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const { quantity } = req.body;
    const itemId = req.params.itemId;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id && item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    // Get product to check stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      throw new BadRequestError('Product is out of stock');
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Save cart
    await cart.save();

    // Populate product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock slug',
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/:itemId
 * @access Private
 */
export const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const itemId = req.params.itemId;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id && item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Save cart
    await cart.save();

    // Populate product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock slug',
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * @route DELETE /api/cart
 * @access Private
 */
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    // Clear cart items
    cart.items = [];

    // Save cart
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
}; 