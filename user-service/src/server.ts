import 'dotenv/config';
import app from './app.js';
import prisma from './lib/prisma.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    logger.info(`User service running on port ${PORT}`);
  });
};

start();