import  Order  from "../../models/order.model.js";
import OrderStatus from "../../models/enum/orderStatus.js";

export default interface OrderService {
  create(order: Order): Promise<Order>;
  getAll(status?: string): Promise<Order[]>;
  getByCustomerId(): Promise<Order[]>;
  getById(id: string): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}