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

  async getAll(status?: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      ...(status ? { where: { status } } : {}),
      include: { items: true }
    });
    return orders.map(o => OrderMapperRepository.fromPrisma(o as unknown as OrderPrismaResponse));
  }

  async getByCustomerId(customerId: number, status?: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        customerId,
        ...(status ? { status } : {})
      },
      include: { items: true }
    });
    return orders.map(o => OrderMapperRepository.fromPrisma(o as unknown as OrderPrismaResponse));
  }

  async getById(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!order) return null;
    return OrderMapperRepository.fromPrisma(order as unknown as OrderPrismaResponse);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    });
    return OrderMapperRepository.fromPrisma(updated as unknown as OrderPrismaResponse);
  }

}