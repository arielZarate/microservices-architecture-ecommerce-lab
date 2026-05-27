import Order from "../../models/order.model.js";
import OrderStatus from "../../models/enum/orderStatus.js";
export default interface OrderService {
    create(order: Order): Promise<Order>;
    getAll(): Promise<Order[]>;
    getById(id: string): Promise<Order | null>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=order.service.interface.d.ts.map