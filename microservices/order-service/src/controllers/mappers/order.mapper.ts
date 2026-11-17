import OrderStatus from "../../models/enum/orderStatus.js";
import Order from "../../models/order.model.js";
import OrderItem from "../../models/orderItem.model.js";
import CreateOrderDTO from "../dto/createOrder.dto.js";
import OrderStatusDTO from "../dto/status.order.dto.js";
import OrderResponseDTO from "../dto/orderResponse.dto.js";

export default class OrderMapper {
  static toDomain(dto: CreateOrderDTO): Order {
    const items: OrderItem[] = dto.items.map(
      item => new OrderItem(item.productId, item.quantity)
    );

    const status = dto.status
      ? dto.status as unknown as OrderStatus
      : OrderStatus.PENDING;

    const order = new Order(
      undefined, 0, '', '', items, 0, status
    );

    return order;
  }

  static toDTO(order: Order): OrderResponseDTO {
    return {
      orderId: order.getId(),
      totalAmount: order.getTotalAmount(),
      status: order.getStatus(),
      items: order.getItems().map(item => ({
        id: item.getId()!,
        productId: item.getProductId(),
        productName: item.getProductName(),
        quantity: item.getQuantity(),
        unitPrice: item.getUnitPrice(),
      }))
    };
  }

}   
