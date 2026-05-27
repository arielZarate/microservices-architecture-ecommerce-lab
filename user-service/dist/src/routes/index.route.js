import { Router } from 'express';
import loginRoute from './login.route.js';
import registerRoute from './register.route.js';
import resetPasswordRoute from './reset.password.route.js';
import apiRoute from './api.route.js';
import healthRoute from './health.route.js';
const router = Router();
// Auth
router.use('/auth', loginRoute);
router.use('/auth', registerRoute);
router.use('/auth', resetPasswordRoute);
// Microservice
router.use('/msv', apiRoute);
// Health check
router.use('/health', healthRoute);
export default router;
//# sourceMappingURL=index.route.js.map