import KafkaProducer from './kafka.producer.js';

 const kafkaInstance = new KafkaProducer(
  process.env.KAFKA_BROKER || 'localhost:9092'
);

export default kafkaInstance;