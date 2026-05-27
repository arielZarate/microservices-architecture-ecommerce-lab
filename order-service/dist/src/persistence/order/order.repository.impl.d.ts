import OrderStatus from '../../models/enum/orderStatus.js';
import Order from '../../models/order.model.js';
import OrderRepository from './order.repository.interface.js';
export default class OrderRepositoryImpl implements OrderRepository {
    create(order: Order): Promise<Order>;
    getAll(): Promise<Order[]>;
    getById(id: string): Promise<Order | null>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=order.repository.impl.d.ts.map