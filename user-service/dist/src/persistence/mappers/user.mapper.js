import User from '../../models/user.model.js';
import UserRole from '../../models/enum/userRole.js';
const validRoles = Object.values(UserRole);
export default class UserMapperRepository {
    static fromPrisma(data) {
        const role = validRoles.includes(data.role)
            ? data.role
            : UserRole.USER;
        return new User(data.id, data.name, data.lastName, data.dni, data.email, data.password, role, data.active, data.cuit ?? undefined, data.address ?? undefined, data.neighborhood ?? undefined, data.city ?? undefined, data.postalCode ?? undefined, data.country ?? undefined, data.phone ?? undefined);
    }
}
//# sourceMappingURL=user.mapper.js.map