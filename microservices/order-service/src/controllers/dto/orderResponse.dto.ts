

interface OrderItemResponse {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderResponseDTO {
  orderId: string;
  totalAmount: number;
  status: string;
  items: OrderItemResponse[];
}



export default OrderResponseDTO