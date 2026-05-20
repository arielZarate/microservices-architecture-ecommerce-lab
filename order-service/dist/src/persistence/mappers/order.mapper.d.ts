import Order from '../../models/order.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
import OrderPrisma from '../model/order.prisma.js';
export default class OrderMapperRepository {
    static fromPrisma(data: OrderPrisma): Order;
    static toPrismaCreate(order: Order): {
        customerId: number;
        customerName: string;
        customerEmail: string;
        totalAmount: number;
        status: OrderStatus;
        items: {
            create: import("../model/item.prisma.js").default[];
        };
    };
}
//# sourceMappingURL=order.mapper.d.ts.map