import Order from '../../models/order.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
export type OrderPrismaResponse = {
    id: string;
    customerId: number;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    items: {
        id: string;
        orderId: string;
        productId: number;
        productName: string | null;
        quantity: number;
        unitPrice: number;
    }[];
};
export default class OrderMapperRepository {
    static fromPrisma(data: OrderPrismaResponse): Order;
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