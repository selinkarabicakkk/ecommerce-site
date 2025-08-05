import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import config from './config/config';
import path from 'path';

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

// TODO: Import and use route files
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: config.nodeEnv === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

export default app; 