import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import itemRoutes from './routes/items.js';
import deliveryPriceRoutes from './routes/deliveryPrices.js';
import categoryRoutes from './routes/categories.js';
import colorRoutes from './routes/colors.js';
import uploadRoutes from './routes/upload.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/delivery-prices', deliveryPriceRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Croche Ella API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
