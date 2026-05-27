import { type Request, type Response, type NextFunction } from 'express';
import RegisterService from '../services/register/register.service.interface.js';
import LoginService from '../services/login/login.service.interface.js';
import ResetPasswordService from '../services/reset-password/reset.password.service.interface.js';
import RegisterResponseDTO from './dto/register.response.dto.js';
import AuthResponseDTO from './dto/auth.response.dto.js';
export default class AuthController {
    private registerService;
    private loginService;
    private resetPasswordService;
    constructor(registerService: RegisterService, loginService: LoginService, resetPasswordService: ResetPasswordService);
    register: (req: Request, res: Response<RegisterResponseDTO>, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response<AuthResponseDTO>, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map