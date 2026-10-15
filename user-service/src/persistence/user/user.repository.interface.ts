import User from '../../models/user.model.js';
import AddressPrismaResponse from '../dto/address.prisma.dto.js';

export default interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCuit(cuit: string): Promise<User | null>;
  findAddressByCustomerId(customerId: number): Promise<AddressPrismaResponse | null>;
  updatePassword(email: string, hashedPassword: string): Promise<void>;
}
