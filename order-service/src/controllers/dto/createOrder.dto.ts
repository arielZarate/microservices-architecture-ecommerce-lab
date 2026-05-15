
// DTO para crear una orden
 interface CreateOrderDTO {

    //data de token 
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status?: string; // Pendiente por defecto
  items:   Array<{
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  }>;

}

export default CreateOrderDTO;