import UserMapperRepository from '../mappers/user.mapper.js';
import prisma from '../../lib/prisma.js';
export default class UserRepositoryImpl {
    async create(user) {
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
        return UserMapperRepository.fromPrisma(created);
    }
    async findByEmail(email) {
        const found = await prisma.user.findUnique({
            where: { email },
        });
        if (!found)
            return null;
        return UserMapperRepository.fromPrisma(found);
    }
    async findByCuit(cuit) {
        const found = await prisma.user.findFirst({
            where: { cuit },
        });
        if (!found)
            return null;
        return UserMapperRepository.fromPrisma(found);
    }
    async updatePassword(email, hashedPassword) {
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
    }
}
//# sourceMappingURL=user.repository.impl.js.map