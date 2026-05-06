import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';


//====ROUTES==========
import indexRouter from './routes/index'

dotenv.config();  //ENVIROMENT

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());



app.use('/api', indexRouter);



//handlerError
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});


//cors



export default app;