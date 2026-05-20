import Order from '../../models/order.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
import ItemMapperRepository from './item.mapper.js';
const validStatuses = Object.values(OrderStatus);
export default class OrderMapperRepository {
    static fromPrisma(data) {
        const orderItems = ItemMapperRepository.fromPrisma(data.items);
        const status = validStatuses.includes(data.status)
            ? data.status
            : OrderStatus.PENDING;
        return new Order(data.id, data.customerId, data.customerName, data.customerEmail, orderItems, Number(data.totalAmount), status);
    }
    static toPrismaCreate(order) {
        return {
            customerId: order.getCustomerId(),
            customerName: order.getCustomerName(),
            customerEmail: order.getCustomerEmail(),
            totalAmount: order.getTotalAmount(),
            status: order.getStatus(),
            items: {
                create: ItemMapperRepository.toPrisma(order.getItems())
            }
        };
    }
}
//# sourceMappingURL=order.mapper.js.map