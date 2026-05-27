import OrderStatus from "../../models/enum/orderStatus.js";
import Order from "../../models/order.model.js";
import OrderItem from "../../models/orderItem.model.js";
export default class OrderMapper {
    static toDomain(dto) {
        const items = dto.items.map(item => new OrderItem(item.productId, item.quantity, undefined, undefined));
        const order = new Order(undefined, 0, '', '', items, 0, OrderStatus.PENDING);
        return order;
    }
}
//# sourceMappingURL=order.mapper.js.map