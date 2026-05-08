import express from 'express';
import orderRoute from './order.route';

const router = express.Router();

// Health check
router.get('/health', (_req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.send({
    status: 'ok',
    service: 'order-service',
    timestamp: new Date().toISOString(),
    uptime: `${uptime.toFixed(2)}s`,
    memory: {
      rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
  });
});

// Root
router.get('/', (_req, res) => {
  res.send('Microservice ORDER 💥');
});

// Routes
router.use('/order', orderRoute);

export default router;