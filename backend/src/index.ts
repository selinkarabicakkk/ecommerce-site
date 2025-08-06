import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import config from './config/config';
import path from 'path';
import { errorHandler, notFound } from './middlewares/errorMiddleware';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import reviewRoutes from './routes/reviewRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import activityRoutes from './routes/activityRoutes';
import wishlistRoutes from './routes/wishlistRoutes';

// Connect to MongoDB
connectDB();

// Initialize Express
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Use route files
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app; 