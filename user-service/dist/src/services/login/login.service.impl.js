import bcrypt from 'bcryptjs';
import { generateToken } from '../../lib/jwt.js';
import { HttpError } from '../../middlewares/errorHandler.js';
class LoginServiceImpl {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async login(data) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new HttpError('Invalid email or password', 401);
        }
        const valid = await bcrypt.compare(data.password, user.getPassword());
        if (!valid) {
            throw new HttpError('Invalid email or password', 401);
        }
        const token = generateToken({
            id: user.getId(),
            email: user.getEmail(),
            role: user.getRole(),
        });
        return {
            token,
            user: {
                id: user.getId(),
                name: user.getName(),
                lastName: user.getLastName(),
                email: user.getEmail(),
                role: user.getRole(),
            },
        };
    }
}
export default LoginServiceImpl;
//# sourceMappingURL=login.service.impl.js.map