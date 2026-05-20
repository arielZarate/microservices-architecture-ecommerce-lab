import express from 'express';
import OrderController from '../controllers/order.controller.js';
import OrderService from '../services/order/order.service.interface.js';
import { OrderServiceImpl } from '../services/order/order.service.impl.js';
import ProductClientService from '../services/product/product.client.service.js';
import OrderRepositoryImpl from '../persistence/order/order.repository.impl.js';
import middleware_security from '../middlewares/token.interceptor.js';

const url = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8080/api';

const productClient = new ProductClientService(url);
const orderRepository = new OrderRepositoryImpl();
const orderService: OrderService = new OrderServiceImpl(productClient, orderRepository);
const orderController = new OrderController(orderService);

const router = express.Router();

router.get('/', orderController.listOrder.bind(orderController));
router.get('/:id', orderController.orderById.bind(orderController));

router.post('/' ,middleware_security,orderController.createOrder.bind(orderController));

router.put('/:id', orderController.updateOrder.bind(orderController));

export default router;