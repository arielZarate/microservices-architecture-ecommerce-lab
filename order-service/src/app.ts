import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import indexRoute from './routes/index.route.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api',indexRoute);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;