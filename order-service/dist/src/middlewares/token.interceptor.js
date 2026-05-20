import jwt from 'jsonwebtoken';
import userContext from "../context/user.context.js";
const secretKey = process.env.JWT_SECRET;
const middleware_security = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'The Token is required' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'The Token is invalid' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        userContext.run(decoded, () => {
            next();
        });
    }
    catch (err) {
        console.log('JWT Error:', err?.message);
        return res.status(401).json({ message: 'The Token is invalid' });
    }
};
export default middleware_security;
//# sourceMappingURL=token.interceptor.js.map