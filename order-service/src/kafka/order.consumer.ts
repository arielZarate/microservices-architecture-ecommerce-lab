import { Kafka, Consumer } from 'kafkajs';
import OrderService from '../services/order/order.service.interface.js';
import OrderStatus from '../models/enum/orderStatus.js';
import { OrderStatusEvent } from './order-event.interface.js';
import logger from '../config/logger.js';

class OrderConsumer{
  private consumer: Consumer;
  private orderService: OrderService;

  constructor(broker: string, orderService: OrderService) {
    const kafka = new Kafka({
      clientId: 'order-service-consumer',
      brokers: [broker],
    });
    this.consumer = kafka.consumer({ groupId: 'order-service-group-V3' });
    this.orderService = orderService;
  }

  async consume(): Promise<void> {
    await this.consumer.connect();
    logger.info('Kafka consumer connected');

    await this.consumer.subscribe({ topic: 'order-preparing', fromBeginning: true });
    await this.consumer.subscribe({ topic: 'order-shipped', fromBeginning: true });
    await this.consumer.subscribe({ topic: 'order-delivered', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event: OrderStatusEvent = JSON.parse(message.value!.toString());
          logger.info(`Kafka received -> ${topic}: order ${event.orderId}`);

          const statusMap: Record<string, OrderStatus> = {
            'order-preparing': OrderStatus.PREPARING,
            'order-shipped': OrderStatus.SHIPPED,
            'order-delivered': OrderStatus.DELIVERED,
          };
          const newStatus = statusMap[topic];
          if (!newStatus) {
            logger.warn(`Unknown topic: ${topic}, skipping`);
            return;
          }

          //==============================================
          //updated order status in the database
          await this.orderService.updateStatus(event.orderId, newStatus);

          logger.info(`Order ${event.orderId} updated to ${newStatus}`);


          //=================================================
        } catch (error) {
          logger.error(`Error processing Kafka message from ${topic}: ${(error as Error).message}`);
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  }
}

export default OrderConsumer;