import express from 'express';
import { HttpError } from '../middlewares/errorHandler.js';

const router = express.Router();

// GET /api/orders - List all orders
router.get('/', (_req, res) => {
  res.json({ message: 'List all orders - TODO' });
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  // TODO: implement
  res.json({ message: `Get order ${id} - TODO` });
});

// POST /api/orders - Create order
router.post('/', (req, res, next) => {
  // TODO: implement
  res.status(201).json({ message: 'Create order - TODO' });
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  // TODO: implement
  res.json({ message: `Update order ${id} status to ${status} - TODO` });
});

// DELETE /api/orders/:id - Soft delete order
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  // TODO: implement
  res.status(204).send();
});

export default router;