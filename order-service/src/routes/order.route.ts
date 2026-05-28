import express from 'express';
import OrderController from '../controllers/order.controller.js';
import OrderService from '../services/order/order.service.interface.js';
import OrderServiceImpl  from '../services/order/order.service.impl.js';
import ProductClientService from '../services/product/product.client.service.js';
import OrderRepositoryImpl from '../persistence/order/order.repository.impl.js';
import middleware_security from '../middlewares/token.interceptor.js';
import KafkaInstance from '../kafka/index.js';
import kafkaInstance from '../kafka/index.js';

const url = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8080/api';


//====INYECTAR KAFKA=========

const productClient = new ProductClientService(url);
const orderRepository = new OrderRepositoryImpl();

const orderService: OrderService = new OrderServiceImpl(productClient, orderRepository,kafkaInstance);
const orderController = new OrderController(orderService);

const router = express.Router();

/**
 * @openapi
 * /api/order:
 *   get:
 *     tags: [Orders]
 *     summary: Listar todas las órdenes
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, PREPARING, SHIPPED, CANCELLED]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponse'
 */
router.get('/', orderController.listOrder.bind(orderController));

/**
 * @openapi
 * /api/order/my:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener órdenes del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Órdenes del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Token requerido
 */
router.get('/my',middleware_security, orderController.myOrders.bind(orderController));

/**
 * @openapi
 * /api/order/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener orden por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Token requerido
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id',middleware_security,orderController.orderById.bind(orderController));

/**
 * @openapi
 * /api/order:
 *   post:
 *     tags: [Orders]
 *     summary: Crear una nueva orden
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 18
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Token requerido
 */
router.post('/' ,middleware_security,orderController.createOrder.bind(orderController));

/**
 * @openapi
 * /api/order/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Actualizar estado de una orden (uso interno)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PAID, PREPARING, SHIPPED, CANCELLED]
 *                 example: PAID
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Transición inválida
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:id/status',orderController.updateOrder.bind(orderController));

export default router;