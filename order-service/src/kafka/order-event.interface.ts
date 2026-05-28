
interface OrderPaidEvent {
  eventType: 'ORDER_PAID';
  orderId: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: number; productName: string; quantity: number; unitPrice: number }>;
}

export default OrderPaidEvent
