// DTO para crear una orden
export interface CreateOrderDTO {

    //data de token 
 // customerId: number;
 // customerName: string;
 // customerEmail: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}
