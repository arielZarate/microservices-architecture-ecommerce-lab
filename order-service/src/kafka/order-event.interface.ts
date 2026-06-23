interface OrderPaidEvent {
  eventType: 'ORDER_PAID';
  orderId: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: number; productName: string; quantity: number; unitPrice: number }>;
}

interface OrderShippedEvent {
  eventType: 'ORDER_SHIPPED';
  orderId: string;
  customerId: number;
  customerName: string;
  status: string;
}

interface OrderDeliveredEvent {
  eventType: 'ORDER_DELIVERED';
  orderId: string;
  customerId: number;
  customerName: string;
  status: string;
}

export type OrderStatusEvent = OrderShippedEvent | OrderDeliveredEvent;

export { OrderPaidEvent, OrderShippedEvent, OrderDeliveredEvent };
