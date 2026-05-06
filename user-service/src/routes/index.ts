import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'User Service Routes' });
});

router.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password and name are required' });
    return;
  }
  
  res.status(201).json({ message: 'User registered', user: { email, name } });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  
  res.json({ message: 'Login successful', token: 'fake-jwt-token' });
});

export default router;