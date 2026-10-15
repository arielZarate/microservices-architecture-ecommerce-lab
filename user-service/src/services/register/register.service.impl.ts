import bcrypt from 'bcryptjs';
import RegisterService from './register.service.interface.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
import User from '../../models/user.model.js';
import UserRole from '../../models/enum/userRole.js';
import RegisterResponseDTO from '../../controllers/dto/register.response.dto.js';
import { HttpError } from '../../middlewares/errorHandler.js';

const SALT_ROUNDS = 10;

class RegisterServiceImpl implements RegisterService {

  constructor(private userRepository: UserRepository) {}

  async register(data: {
    name: string;
    lastName: string;
    dni: string;
    email: string;
    password: string;
    role?: string;
    cuit?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  }): Promise<RegisterResponseDTO> {
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

    const role = data.role && Object.values(UserRole).includes(data.role as UserRole)
      ? (data.role as UserRole)
      : UserRole.USER;

    const user = new User(
      undefined,
      data.name,
      data.lastName,
      data.dni,
      data.email,
      hashedPassword,
      role,
      true,
      data.cuit,
      data.address,
      data.neighborhood,
      data.city,
      data.postalCode,
      data.country,
      data.phone
    );

    const created = await this.userRepository.create(user);

    return {
      id: created.getId()!,
      name: created.getName(),
      lastName: created.getLastName(),
      email: created.getEmail(),
      role: created.getRole(),
    };
  }

  private validateRequiredFields(data: {
    name: string; lastName: string; dni: string; email: string; password: string;
  }): void {
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

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError('Invalid email format', 400);
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 6) {
      throw new HttpError('Password must be at least 6 characters', 400);
    }
  }

  private validateDni(dni: string): void {
    if (!/^\d{7,8}$/.test(dni)) {
      throw new HttpError('DNI must be 7 or 8 digits', 400);
    }
  }

  private validateCuit(cuit: string | undefined): void {
    if (!cuit) return;
    if (!/^\d{2}-\d{8}-\d{1}$/.test(cuit)) {
      throw new HttpError('Invalid CUIT format (expected XX-XXXXXXXX-X)', 400);
    }
  }
}

export default RegisterServiceImpl;
