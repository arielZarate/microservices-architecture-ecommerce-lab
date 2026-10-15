import bcrypt from 'bcryptjs';
import LoginService from './login.service.interface.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
import AuthResponseDTO from '../../controllers/dto/auth.response.dto.js';
import { generateToken } from '../../lib/jwt.js';
import { HttpError } from '../../middlewares/errorHandler.js';

class LoginServiceImpl implements LoginService {
  constructor(private userRepository: UserRepository) {}

  async login(data: { email: string; password: string }): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new HttpError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(data.password, user.getPassword());
    if (!valid) {
      throw new HttpError('Invalid email or password', 401);
    }

    const token = generateToken({
      id: user.getId()!,
      name: user.getName(),
      lastName: user.getLastName(),
      email: user.getEmail(),
      role: user.getRole(),
    });

    return {
      token,
      user: {
        id: user.getId()!,
        name: user.getName(),
        lastName: user.getLastName(),
        email: user.getEmail(),
        role: user.getRole(),
      },
    };
  }
}

export default LoginServiceImpl;
