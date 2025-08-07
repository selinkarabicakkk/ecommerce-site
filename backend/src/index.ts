import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import config from './config/config';
import path from 'path';
import { errorHandler, notFound } from './middlewares/errorMiddleware';
import { setupSwagger } from './config/swagger';

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
import searchRoutes from './routes/searchRoutes';
import recommendationRoutes from './routes/recommendationRoutes';

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

// Swagger dokümantasyonunu kur
setupSwagger(app);

// Static folder for uploads
app.use('/images', express.static(path.join(__dirname, '../uploads/images')));

// API Routes
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Use route files
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Aliases for convenience and matching spec
app.use('/api/user', userRoutes);
app.use('/api/user/wishlist', wishlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/activities', activityRoutes);
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