import bcrypt from 'bcryptjs';
import User from '../../models/user.model.js';
import UserRole from '../../models/enum/userRole.js';
import { HttpError } from '../../middlewares/errorHandler.js';
const SALT_ROUNDS = 10;
class RegisterServiceImpl {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(data) {
        this.validateRequiredFields(data);
        this.validateEmail(data.email);
        this.validatePassword(data.password);
        this.validateDni(data.dni);
        this.validateCuit(data.cuit);
        const existingEmail = await this.userRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new HttpError('Email already registered', 409);
        }
        if (data.cuit) {
            const existingCuit = await this.userRepository.findByCuit(data.cuit);
            if (existingCuit) {
                throw new HttpError('CUIT already registered', 409);
            }
        }
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
        const role = data.role && Object.values(UserRole).includes(data.role)
            ? data.role
            : UserRole.USER;
        const user = new User(undefined, data.name, data.lastName, data.dni, data.email, hashedPassword, role, true, data.cuit, data.address, data.neighborhood, data.city, data.postalCode, data.country, data.phone);
        const created = await this.userRepository.create(user);
        return {
            id: created.getId(),
            name: created.getName(),
            lastName: created.getLastName(),
            email: created.getEmail(),
            role: created.getRole(),
        };
    }
    validateRequiredFields(data) {
        if (!data.name || data.name.trim().length < 2) {
            throw new HttpError('Name must be at least 2 characters', 400);
        }
        if (!data.lastName || data.lastName.trim().length < 2) {
            throw new HttpError('Last name must be at least 2 characters', 400);
        }
        if (!data.dni || !data.email || !data.password) {
            throw new HttpError('Missing required fields', 400);
        }
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new HttpError('Invalid email format', 400);
        }
    }
    validatePassword(password) {
        if (password.length < 6) {
            throw new HttpError('Password must be at least 6 characters', 400);
        }
    }
    validateDni(dni) {
        if (!/^\d{7,8}$/.test(dni)) {
            throw new HttpError('DNI must be 7 or 8 digits', 400);
        }
    }
    validateCuit(cuit) {
        if (!cuit)
            return;
        if (!/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
            throw new HttpError('Invalid CUIT format (expected XX-XXXXXXXX-X)', 400);
        }
    }
}
export default RegisterServiceImpl;
//# sourceMappingURL=register.service.impl.js.map