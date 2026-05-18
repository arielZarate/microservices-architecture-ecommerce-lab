import OrderStatus from "../../models/enum/orderStatus.js";
import Order from "../../models/order.model.js";
import OrderRepository from "./order.repository.interface.js";
import prisma from "../../lib/prisma.js";
export default class OrderRepositoryImpl implements OrderRepository {

    create(order: Order): Promise<Order> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<Order[]> {
        throw new Error("Method not implemented.");
    }
    getById(id: string): Promise<Order | null> {
        throw new Error("Method not implemented.");
    }
    updateStatus(id: string, status: OrderStatus): Promise<Order> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    

}