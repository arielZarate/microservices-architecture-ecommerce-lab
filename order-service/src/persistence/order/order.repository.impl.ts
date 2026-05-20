import OrderStatus from '../../models/enum/orderStatus.js';
import Order from '../../models/order.model.js';
import OrderRepository from './order.repository.interface.js';
import prisma from '../../lib/prisma.js';
import OrderMapperRepository from '../mappers/order.mapper.js';
import OrderPrismaResponse from '../dto/order.response.prisma.dto.js';

export default class OrderRepositoryImpl implements OrderRepository {


  async create(order: Order): Promise<Order> {
    const created = await prisma.order.create({
      data: OrderMapperRepository.toPrismaCreate(order),
      include: {
        items: true
      }
    });

    return OrderMapperRepository.fromPrisma(created as unknown as OrderPrismaResponse);
  }

  getAll(): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }

  getById(id: string): Promise<Order | null> {
    throw new Error('Method not implemented.');
  }

  updateStatus(id: string, status: OrderStatus): Promise<Order> {
    throw new Error('Method not implemented.');
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}