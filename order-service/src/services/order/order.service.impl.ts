import { OrderService } from './order.service.interface.js';
import { Order } from '../../models/order.model.js';
import { OrderStatus } from '../../models/enum/orderStatus.js';

export class OrderServiceImpl implements OrderService {
  async create(order: Order): Promise<Order> {
    throw new Error('Method not implemented.');
  }

  async getAll(): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }

  async getById(id: string): Promise<Order | null> {
    throw new Error('Method not implemented.');
  }

  async getByCustomerId(customerId: number): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}