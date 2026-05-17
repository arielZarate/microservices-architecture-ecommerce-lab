
// DTO para crear una orden
 interface CreateOrderDTO {
  totalAmount: number;
  status?: string; // Pendiente por defecto
  items:   Array<{
    productId: number;
    quantity: number;
  }>;

}

export default CreateOrderDTO;