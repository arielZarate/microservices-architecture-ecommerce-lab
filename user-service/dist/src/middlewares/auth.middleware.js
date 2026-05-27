import { verifyToken } from '../lib/jwt.js';
import { HttpError } from './errorHandler.js';
export function authMiddleware(req, _res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new HttpError('Missing or invalid token', 401);
        }
        const token = header.split(' ')[1];
        if (!token) {
            throw new HttpError('Missing or invalid token', 401);
        }
        const payload = verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.middleware.js.map