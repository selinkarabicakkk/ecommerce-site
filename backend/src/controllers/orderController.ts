import { Request, Response, NextFunction } from 'express';
import { Order, Cart, Product, ActivityLog } from '../models';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errorUtils';

/**
 * Create new order
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // Check if order items exist
    if (!orderItems || orderItems.length === 0) {
      throw new BadRequestError('No order items');
    }

    // Calculate prices
    let subtotal = 0;
    const updatedOrderItems = [];

    // Verify products and calculate prices
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new NotFoundError(`Product not found: ${item.product}`);
      }

      // Check if product is in stock
      if (product.stock < item.quantity) {
        throw new BadRequestError(`Product ${product.name} is out of stock`);
      }

      // Calculate item price
      const itemPrice = product.price * item.quantity;
      subtotal += itemPrice;

      // Add item to order with product details
      updatedOrderItems.push({
        product: item.product,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0],
        variantOptions: item.variantOptions,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      // Log purchase activity for recommendations
      await ActivityLog.create({
        user: req.user.id,
        product: product._id,
        activityType: 'purchase',
      });
    }

    // Calculate tax and shipping
    const taxRate = 0.18; // 18% tax
    const taxPrice = subtotal * taxRate;
    
    // Shipping is free for orders over $100, otherwise $10
    const shippingPrice = subtotal > 100 ? 0 : 10;
    
    // Calculate total price
    const totalPrice = subtotal + taxPrice + shippingPrice;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      status: 'pending',
    });

    // Clear user's cart after successful order
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders
 * @route GET /api/orders
 * @access Private/Admin
 */
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to access this resource');
    }

    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter: Record<string, any> = {};

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    const count = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true,
      count,
      pages: Math.ceil(count / pageSize),
      page,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user orders
 * @route GET /api/orders/myorders
 * @access Private
 */
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const order = await Order.findById(req.params.id).populate(
      'user',
      'firstName lastName email'
    );

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user is owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to view this order');
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 * @access Private/Admin
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized');
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Update status
    order.status = status;

    // Update delivery status if status is 'delivered'
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order to paid
 * @route PUT /api/orders/:id/pay
 * @access Private
 */
export const updateOrderToPaid = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Not authorized');
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user is owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to update this order');
    }

    // Update payment status
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.updateTime,
      emailAddress: req.body.emailAddress,
    };

    // Update order status to 'processing' if it was 'pending'
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}; 