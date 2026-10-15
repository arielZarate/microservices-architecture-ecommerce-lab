import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Request, type Response, type NextFunction } from 'express';
import AuthController from './auth.controller.js';
import RegisterService from '../services/register/register.service.interface.js';
import LoginService from '../services/login/login.service.interface.js';
import ResetPasswordService from '../services/reset-password/reset.password.service.interface.js';
import RegisterResponseDTO from './dto/register.response.dto.js';
import AuthResponseDTO from './dto/auth.response.dto.js';

const mockRegisterService: RegisterService = {
  register: vi.fn(),
};

const mockLoginService: LoginService = {
  login: vi.fn(),
};

const mockResetPasswordService: ResetPasswordService = {
  reset: vi.fn(),
};

function mockReq(body: Record<string, unknown>): Request {
  return { body } as Request;
}

function mockRes(): Response {
  const res: Record<string, unknown> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as unknown as Response;
}

describe('AuthController', () => {
  let controller: AuthController;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(mockRegisterService, mockLoginService, mockResetPasswordService);
    res = mockRes();
    next = vi.fn();
  });

  describe('register', () => {
    it('should return 201 with user data on success', async () => {
      const userData: RegisterResponseDTO = { id: 1, name: 'Juan', lastName: 'Perez', email: 'juan@test.com', role: 'USER' };
      vi.mocked(mockRegisterService.register).mockResolvedValue(userData);

      await controller.register(mockReq({ name: 'Juan' }), res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(userData);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Email already registered');
      vi.mocked(mockRegisterService.register).mockRejectedValue(error);

      await controller.register(mockReq({}), res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should return 200 with token on success', async () => {
      const authData: AuthResponseDTO = { token: 'xxx', user: { id: 1, name: 'Juan', lastName: 'Perez', email: 'juan@test.com', role: 'USER' } };
      vi.mocked(mockLoginService.login).mockResolvedValue(authData);

      await controller.login(mockReq({ email: 'juan@test.com', password: '123456' }), res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authData);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Invalid email or password');
      vi.mocked(mockLoginService.login).mockRejectedValue(error);

      await controller.login(mockReq({}), res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('resetPassword', () => {
    it('should return 200 with message on success', async () => {
      vi.mocked(mockResetPasswordService.reset).mockResolvedValue(undefined);

      await controller.resetPassword(mockReq({ email: 'juan@test.com', newPassword: 'nueva123' }), res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('User not found');
      vi.mocked(mockResetPasswordService.reset).mockRejectedValue(error);

      await controller.resetPassword(mockReq({}), res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
