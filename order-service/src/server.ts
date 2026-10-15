import 'dotenv/config';
import { Server } from 'http';
import app from './app.js';
import prisma from './lib/prisma.js';
import logger from './config/logger.js';
import OrderConsumer from './kafka/order.consumer.js';
import { kafkaProducer, orderService, KAFKA_BROKER } from './di/container.js';

const PORT = process.env.PORT || 3000;
let orderConsumer: OrderConsumer;
let httpServer: Server;

async function start() {
  try {
    await prisma.$connect()
    logger.info("database connected sucessfully")
  
  } catch (error:unknown) {
     logger.error(
      `DATABASE CONNECTION ERROR: ${(error as Error).message}`
    );
    process.exit(1);
  
  }

  try {
    await kafkaProducer.connect();
  } catch (error) {
   logger.warn(`Kafka producer not available: ${(error as Error).message}`);
  }

  try {
    orderConsumer = new OrderConsumer(KAFKA_BROKER, orderService);
    await orderConsumer.consume();
  } catch (error) {
    logger.warn(`Kafka consumer not available: ${(error as Error).message}`);
  }

  httpServer = app.listen(PORT, () => {
     logger.info(`Order service running on port ${PORT}`)
  });
}

async function shutdown() {
  logger.info('Shutting down gracefully...');

  httpServer?.close();

  if (orderConsumer) {
    await orderConsumer.disconnect();
  }
  await kafkaProducer.disconnect();
  await prisma.$disconnect();

  logger.info('All connections closed');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((error)=>{
  logger.error(
    `APPLICATION START ERROR: ${(error as Error).message}`
  );
});
