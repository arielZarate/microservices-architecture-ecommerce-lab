import LoginService from './login.service.interface.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
import AuthResponseDTO from '../../controllers/dto/auth.response.dto.js';
declare class LoginServiceImpl implements LoginService {
    private userRepository;
    constructor(userRepository: UserRepository);
    login(data: {
        email: string;
        password: string;
    }): Promise<AuthResponseDTO>;
}
export default LoginServiceImpl;
//# sourceMappingURL=login.service.impl.d.ts.map