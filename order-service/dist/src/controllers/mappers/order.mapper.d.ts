import Order from "../../models/order.model.js";
import CreateOrderDTO from "../dto/createOrder.dto.js";
export default class OrderMapper {
    static toDomain(dto: CreateOrderDTO): Order;
}
//# sourceMappingURL=order.mapper.d.ts.map