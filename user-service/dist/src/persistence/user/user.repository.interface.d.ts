import User from '../../models/user.model.js';
export default interface UserRepository {
    create(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByCuit(cuit: string): Promise<User | null>;
    updatePassword(email: string, hashedPassword: string): Promise<void>;
}
//# sourceMappingURL=user.repository.interface.d.ts.map