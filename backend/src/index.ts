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
import categoryRoutes, { adminCategoriesRouter } from './routes/categoryRoutes';
import productRoutes, { adminProductsRouter } from './routes/productRoutes';
import reviewRoutes from './routes/reviewRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import activityRoutes from './routes/activityRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import searchRoutes from './routes/searchRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import emailRoutes from './routes/emailRoutes';

// Connect to MongoDB
connectDB();

// Initialize Express
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Centralized CORS options to support preflight (OPTIONS) and auth headers
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    const allowed = [
      config.frontendUrl,
      'https://'+(process.env.VERCEL_URL || ''),
    ].filter(Boolean);
    if (allowed.some((u) => origin === u)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Ensure preflight requests are handled for all routes
app.options('*', cors(corsOptions));

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
// Wishlist only under /api/user/wishlist as per spec
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailRoutes);
// Admin aliases
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app; 