import ResetPasswordService from './reset.password.service.interface.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
declare class ResetPasswordServiceImpl implements ResetPasswordService {
    private userRepository;
    constructor(userRepository: UserRepository);
    reset(email: string, newPassword: string): Promise<void>;
}
export default ResetPasswordServiceImpl;
//# sourceMappingURL=reset.password.service.impl.d.ts.map