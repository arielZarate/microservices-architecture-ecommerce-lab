import  express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan('dev'));


app.get('/', (req, res) => res.send('Hello World!'))


export default app;