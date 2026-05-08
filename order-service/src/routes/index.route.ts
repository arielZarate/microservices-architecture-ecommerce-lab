import express from 'express';
import orderRoute from './order.route';

const router = express.Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

// Root
router.get('/', (_req, res) => {
  res.send('Microservice ORDER 💥');
});

// Routes
router.use('/orders', orderRoute);

export default router;