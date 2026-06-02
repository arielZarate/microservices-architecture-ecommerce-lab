import { type Request, type Response, type NextFunction } from 'express';
import RegisterService from '../services/register/register.service.interface.js';
import LoginService from '../services/login/login.service.interface.js';
import ResetPasswordService from '../services/reset-password/reset.password.service.interface.js';
import RegisterDTO from './dto/register.dto.js';
import LoginDTO from './dto/login.dto.js';
import ResetPasswordDTO from './dto/reset.password.dto.js';
import RegisterResponseDTO from './dto/register.response.dto.js';
import AuthResponseDTO from './dto/auth.response.dto.js';
import logger from '../config/logger.js';

export default class AuthController {
  constructor(
    private registerService: RegisterService,
    private loginService: LoginService,
    private resetPasswordService: ResetPasswordService
  ) {}

  register = async (req: Request, res: Response<RegisterResponseDTO>, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterDTO;
      logger.info(`Registering new user with email: ${body.email}`);
      const result: RegisterResponseDTO = await this.registerService.register(body);
      res.status(201).json(result);
    } catch (error: unknown) {
      logger.error('Error occurred while registering user');
      next(error);
    }
  };

  login = async (req: Request, res: Response<AuthResponseDTO>, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as LoginDTO;
      logger.info(`Login attempt for email: ${email}`);
      const result: AuthResponseDTO = await this.loginService.login({ email, password });
      res.status(200).json(result);
    } catch (error: unknown) {
      logger.error('Error occurred while logging in');
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, newPassword } = req.body as ResetPasswordDTO;
      logger.info(`Resetting password for email: ${email}`);
      await this.resetPasswordService.reset(email, newPassword);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: unknown) {
      logger.error('Error occurred while resetting password');
      next(error);
    }
  };
}
