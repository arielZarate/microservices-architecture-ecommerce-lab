import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const SECRET = secret;
export function generateToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '24h' });
}
//# sourceMappingURL=jwt.js.map