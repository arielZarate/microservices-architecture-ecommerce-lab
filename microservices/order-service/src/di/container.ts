import KafkaProducer from '../kafka/kafka.producer.js';
import ProductClientService from '../services/product/product.client.service.js';
import OrderRepositoryImpl from '../persistence/order/order.repository.impl.js';
import OrderServiceImpl from '../services/order/order.service.impl.js';
import OrderController from '../controllers/order.controller.js';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8080/api';

const kafkaProducer = new KafkaProducer(KAFKA_BROKER);
const productClient = new ProductClientService(PRODUCT_SERVICE_URL);
const orderRepository = new OrderRepositoryImpl();
const orderService = new OrderServiceImpl(productClient, orderRepository, kafkaProducer);
const orderController = new OrderController(orderService);

export { kafkaProducer, orderService, orderController, KAFKA_BROKER };
