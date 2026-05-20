import ItemPrisma from "./item.prisma.js";
type OrderPrisma = {
    id: string;
    customerId: number;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    items: ItemPrisma[];
};
export default OrderPrisma;
//# sourceMappingURL=order.prisma.d.ts.map