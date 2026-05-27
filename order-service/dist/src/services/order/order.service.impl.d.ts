import OrderService from './order.service.interface.js';
import Order from '../../models/order.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
import ProductClient from '../product/product.client.interface.js';
import OrderRepository from '../../persistence/order/order.repository.interface.js';
export declare class OrderServiceImpl implements OrderService {
    private productClient;
    private orderRepository;
    constructor(productClient: ProductClient, orderRepository: OrderRepository);
    private validateUserContext;
    create(order: Order): Promise<any>;
    getAll(): Promise<Order[]>;
    getById(id: string): Promise<Order | null>;
    getByCustomerId(customerId: number): Promise<Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=order.service.impl.d.ts.map