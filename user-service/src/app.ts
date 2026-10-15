import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import indexRouter from './routes/index.route.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', indexRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;