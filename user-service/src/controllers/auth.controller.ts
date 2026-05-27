import { type Request, type Response, type NextFunction } from 'express';
import RegisterService from '../services/register/register.service.interface.js';
import RegisterDTO from './dto/register.dto.js';
import RegisterResponseDTO from './dto/register.response.dto.js';

export default class AuthController {
  constructor(private registerService: RegisterService) {}

  register = async (req: Request, res: Response<RegisterResponseDTO>, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterDTO;
      const result: RegisterResponseDTO = await this.registerService.register(body);
      res.status(201).json(result);
    } catch (error: unknown) {
      next(error);
    }
  };
}
