import User from '../../models/user.model.js';
import UserRepository from './user.repository.interface.js';
import UserMapperRepository from '../mappers/user.mapper.js';
import UserPrismaResponse from '../dto/user.prisma.dto.js';
import prisma from '../../lib/prisma.js';

export default class UserRepositoryImpl implements UserRepository {

  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: user.getName(),
        lastName: user.getLastName(),
        dni: user.getDni(),
        cuit: user.getCuit() ?? null,
        address: user.getAddress() ?? null,
        neighborhood: user.getNeighborhood() ?? null,
        city: user.getCity() ?? null,
        postalCode: user.getPostalCode() ?? null,
        country: user.getCountry() ?? null,
        email: user.getEmail(),
        password: user.getPassword(),
        phone: user.getPhone() ?? null,
        role: user.getRole(),
        active: user.getActive(),
      },
    });

    return UserMapperRepository.fromPrisma(created as unknown as UserPrismaResponse);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findUnique({
      where: { email },
    });

    if (!found) return null;
    return UserMapperRepository.fromPrisma(found as unknown as UserPrismaResponse);
  }

  async findByCuit(cuit: string): Promise<User | null> {
    const found = await prisma.user.findFirst({
      where: { cuit },
    });

    if (!found) return null;
    return UserMapperRepository.fromPrisma(found as unknown as UserPrismaResponse);
  }
}
