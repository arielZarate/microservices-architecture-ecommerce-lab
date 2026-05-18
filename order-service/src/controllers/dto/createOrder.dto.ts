
// DTO para crear una orden
 interface CreateOrderDTO {
  status?: string; // Pendiente por defecto
  items:   Array<{
    productId: number;
    quantity: number;
  }>;

}

export default CreateOrderDTO;