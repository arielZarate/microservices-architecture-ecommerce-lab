import User from '../../models/user.model.js';
import UserRepository from './user.repository.interface.js';
export default class UserRepositoryImpl implements UserRepository {
    create(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByCuit(cuit: string): Promise<User | null>;
}
//# sourceMappingURL=user.repository.impl.d.ts.map