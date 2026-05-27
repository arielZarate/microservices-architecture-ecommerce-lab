import RegisterService from './register.service.interface.js';
import UserRepository from '../../persistence/user/user.repository.interface.js';
import RegisterResponseDTO from '../../controllers/dto/register.response.dto.js';
declare class RegisterServiceImpl implements RegisterService {
    private userRepository;
    constructor(userRepository: UserRepository);
    register(data: {
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
    }): Promise<RegisterResponseDTO>;
    private validateRequiredFields;
    private validateEmail;
    private validatePassword;
    private validateDni;
    private validateCuit;
}
export default RegisterServiceImpl;
//# sourceMappingURL=register.service.impl.d.ts.map