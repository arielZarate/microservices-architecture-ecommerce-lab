import 'dotenv/config';
import app from './app.js';
import kafkaInstance from './kafka/index.js';
import prisma from './lib/prisma.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 3000;

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
    //kafka optional
    await kafkaInstance.connect();
  } catch (error) {
   logger.warn(`Kafka not available: ${(error as Error).message}`);
  }

  app.listen(PORT, () => {
     logger.info(`Order service running on port ${PORT}`)
  });
}

start().catch((error)=>{
 logger.error(
    `APPLICATION START ERROR: ${(error as Error).message}`
  );
});
