import OrderStatus from "../../models/enum/orderStatus.js";
import Order from "../../models/order.model.js";

export default interface OrderRepository {
  create(order: Order): Promise<Order>;
  getAll(status?: string): Promise<Order[]>;
  getByCustomerId(customerId: number, status?: string): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
 
}