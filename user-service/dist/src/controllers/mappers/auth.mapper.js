import User from "../../models/user.model.js";
import UserRole from "../../models/enum/userRole.js";
export default class AuthMapper {
    static toDomain(dto) {
        return new User(undefined, dto.name, dto.lastName, dto.dni, dto.email, dto.password, UserRole.USER, true, dto.cuit, dto.address, dto.neighborhood, dto.city, dto.postalCode, dto.country, dto.phone);
    }
}
//# sourceMappingURL=auth.mapper.js.map