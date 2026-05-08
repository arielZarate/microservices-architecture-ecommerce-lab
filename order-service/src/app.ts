import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import indexRoute from './routes/index.route';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());        //cors en cada request
app.use(morgan('dev')); //logging en cada request 
app.use(express.json()); //interceptor de archivos json

// Routes
app.use('/api', indexRoute);

// Error handlers
app.use(notFoundHandler); //interceptor de request incorrectos
app.use(errorHandler);

export default app;