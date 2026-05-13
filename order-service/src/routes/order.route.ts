import express from 'express';
import OrderController from '../controllers/order.controller.js';
import { OrderService } from '../services/order/order.service.interface.js';
import { OrderServiceImpl } from '../services/order/order.service.impl.js';

const orderService: OrderService = new OrderServiceImpl();
const orderController = new OrderController(orderService);

const router = express.Router();

router.get('/', orderController.listOrder.bind(orderController));
router.get('/:id', orderController.orderById.bind(orderController));
router.post('/', orderController.createOrder.bind(orderController));
router.put('/:id', orderController.updateOrder.bind(orderController));
router.delete('/:id', orderController.deleteOrder.bind(orderController));

export default router;