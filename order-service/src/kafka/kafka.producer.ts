import { Kafka, Producer } from 'kafkajs';
import logger from '../config/logger.js';

class KafkaProducer {
  private producer: Producer;
  private connected = false;

  constructor(broker: string) {
    const kafka = new Kafka({
      clientId: 'order-service',
      brokers: [broker],
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
  try {
      if (this.connected) return;
    await this.producer.connect();
    this.connected = true;
     logger.info('Kafka producer connected');

  } catch (error:unknown) {
      logger.error('KAFKA ERROR', error)
      throw error
    }
  }

  async publish<T>(topic: string, message: T): Promise<void> {
    try {
      await this.connect();
      await this.producer.send({
      topic,
      messages: [
        { 
        key:crypto.randomUUID(),
        value: JSON.stringify(message),
        timestamp:Date.now().toString() 
         
      }
    ]});

    logger.info(`PAID EVENT PRODUCER  -> ${topic}`)

    } catch (error:unknown) {
        logger.error('KAFKA PUBLISH ERROR', error);
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.connected = false;

    logger.info('Kafka producer disconnected');
  }

}

export default KafkaProducer;