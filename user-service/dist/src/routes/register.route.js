import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import RegisterServiceImpl from '../services/register/register.service.impl.js';
import UserRepositoryImpl from '../persistence/user/user.repository.impl.js';
const userRepository = new UserRepositoryImpl();
const registerService = new RegisterServiceImpl(userRepository);
const authController = new AuthController(registerService);
const router = Router();
router.post('/register', authController.register.bind(authController));
export default router;
//# sourceMappingURL=register.route.js.map