import AuthResponseDTO from '../../controllers/dto/auth.response.dto.js';
export default interface LoginService {
    login(data: {
        email: string;
        password: string;
    }): Promise<AuthResponseDTO>;
}
//# sourceMappingURL=login.service.interface.d.ts.map