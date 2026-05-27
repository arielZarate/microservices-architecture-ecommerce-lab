import User from "../../models/user.model.js";
import UserRole from "../../models/enum/userRole.js";
import RegisterDTO from "../dto/register.dto.js";

export default class AuthMapper {
  static toDomain(dto: RegisterDTO): User {
    return new User(
      undefined,
      dto.name,
      dto.lastName,
      dto.dni,
      dto.email,
      dto.password,
      UserRole.USER,
      true,
      dto.cuit,
      dto.address,
      dto.neighborhood,
      dto.city,
      dto.postalCode,
      dto.country,
      dto.phone
    );
  }
}
