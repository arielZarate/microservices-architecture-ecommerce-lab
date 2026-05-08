import { Router, Request, Response } from 'express';
import loginController from '../controllers/LoginController'
const router = Router();


router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'User Service Routes' });
});


router.post('/login' ,loginController);



export default router;