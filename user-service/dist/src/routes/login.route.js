import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import RegisterServiceImpl from '../services/register/register.service.impl.js';
import LoginServiceImpl from '../services/login/login.service.impl.js';
import ResetPasswordServiceImpl from '../services/reset-password/reset.password.service.impl.js';
import UserRepositoryImpl from '../persistence/user/user.repository.impl.js';
const userRepository = new UserRepositoryImpl();
const registerService = new RegisterServiceImpl(userRepository);
const loginService = new LoginServiceImpl(userRepository);
const resetPasswordService = new ResetPasswordServiceImpl(userRepository);
const authController = new AuthController(registerService, loginService, resetPasswordService);
const router = Router();
router.post('/login', authController.login.bind(authController));
export default router;
//# sourceMappingURL=login.route.js.map