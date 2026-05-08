import { Order } from "../../models/order.model";
import { OrderStatus } from "../../models/enum/orderStatus";

export interface OrderService {
  create(order: Order): Promise<Order>;
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | null>;
  getByCustomerId(customerId: number): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  delete(id: string): Promise<void>;
}