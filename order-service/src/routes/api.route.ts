import express from 'express';
const router = express.Router();



// Root
router.get('/', (req: express.Request, res: express.Response) => {
  res.json('🔥Microservice ORDER 💥');
});

export default router;  