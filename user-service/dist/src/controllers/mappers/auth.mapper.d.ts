import User from "../../models/user.model.js";
import RegisterDTO from "../dto/register.dto.js";
export default class AuthMapper {
    static toDomain(dto: RegisterDTO): User;
}
//# sourceMappingURL=auth.mapper.d.ts.map