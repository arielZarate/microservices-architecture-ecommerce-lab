
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
    //productName: string; //TODO: esto no se si es necesario, lo puedo sacar del product service
    //unitPrice: number; //TODO: esto no se si es necesario, lo puedo sacar del product service
    quantity: number;
  }>;

}

export default CreateOrderDTO;