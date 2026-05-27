import RegisterResponseDTO from '../../controllers/dto/register.response.dto.js';
export default interface RegisterService {
    register(data: {
        name: string;
        lastName: string;
        dni: string;
        email: string;
        password: string;
        cuit?: string;
        address?: string;
        neighborhood?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        role?: string;
        phone?: string;
    }): Promise<RegisterResponseDTO>;
}
//# sourceMappingURL=register.service.interface.d.ts.map