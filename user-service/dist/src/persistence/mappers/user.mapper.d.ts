import User from '../../models/user.model.js';
import UserPrismaResponse from '../dto/user.prisma.dto.js';
export default class UserMapperRepository {
    static fromPrisma(data: UserPrismaResponse): User;
}
//# sourceMappingURL=user.mapper.d.ts.map