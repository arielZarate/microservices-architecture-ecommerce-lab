import { type Request, type Response, type NextFunction } from 'express';
import RegisterService from '../services/register/register.service.interface.js';
export default class AuthController {
    private registerService;
    constructor(registerService: RegisterService);
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map