import prisma from '../../lib/prisma.js';
import OrderMapperRepository from '../mappers/order.mapper.js';
export default class OrderRepositoryImpl {
    async create(order) {
        const created = await prisma.order.create({
            data: OrderMapperRepository.toPrismaCreate(order),
            include: {
                items: true
            }
        });
        return OrderMapperRepository.fromPrisma(created);
    }
    getAll() {
        throw new Error('Method not implemented.');
    }
    getById(id) {
        throw new Error('Method not implemented.');
    }
    updateStatus(id, status) {
        throw new Error('Method not implemented.');
    }
    delete(id) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=order.repository.impl.js.map