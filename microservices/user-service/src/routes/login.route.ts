import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import RegisterService from '../services/register/register.service.interface.js';
import RegisterServiceImpl from '../services/register/register.service.impl.js';
import LoginService from '../services/login/login.service.interface.js';
import LoginServiceImpl from '../services/login/login.service.impl.js';
import ResetPasswordService from '../services/reset-password/reset.password.service.interface.js';
import ResetPasswordServiceImpl from '../services/reset-password/reset.password.service.impl.js';
import UserRepositoryImpl from '../persistence/user/user.repository.impl.js';

const userRepository = new UserRepositoryImpl();
const registerService: RegisterService = new RegisterServiceImpl(userRepository);
const loginService: LoginService = new LoginServiceImpl(userRepository);
const resetPasswordService: ResetPasswordService = new ResetPasswordServiceImpl(userRepository);
const authController = new AuthController(registerService, loginService, resetPasswordService);

const router = Router();

router.post('/login', authController.login.bind(authController));

export default router;
