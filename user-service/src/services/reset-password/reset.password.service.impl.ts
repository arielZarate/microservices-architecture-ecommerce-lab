import bcrypt from 'bcryptjs';
import ResetPasswordService from './reset.password.service.interface.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
import { HttpError } from '../../middlewares/errorHandler.js';

const SALT_ROUNDS = 10;

class ResetPasswordServiceImpl implements ResetPasswordService {
  constructor(private userRepository: UserRepository) {}

  async reset(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError('User not found', 404);
    }

    if (newPassword.length < 6) {
      throw new HttpError('Password must be at least 6 characters', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.updatePassword(email, hashedPassword);
  }
}

export default ResetPasswordServiceImpl;
