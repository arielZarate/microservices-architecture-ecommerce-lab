import OrderStatus from "../enum/orderStatus.js";

class OrderStatusTransition {
  static isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],                   
      [OrderStatus.DELIVERED]: [],    
      [OrderStatus.CANCELLED]: [],
    };
    return transitions[current]?.includes(next) ?? false;
  }
}

export default OrderStatusTransition;   


