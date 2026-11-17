
import { Request, Response, NextFunction } from 'express';  


const validateHeader = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-middleware-apikey'] as string | undefined;
  const deviceId = req.headers['x-middleware-deviceid'] as string | undefined;

  if (!apiKey && !deviceId) {
    return res.status(401).json({ error: 'API Key header is missing' });
  }

  if (apiKey !== process.env.API_KEY || deviceId !== process.env.DEVICE_ID) {
    return res.status(403).json({ error: 'Invalid API Key' });
  }

  next();
};



export default validateHeader;