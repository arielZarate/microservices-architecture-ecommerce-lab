
import { OrderItem } from "../../models/orderItem.model.js";


export interface OrderResponseDTO {
  id: string;

  //estos datos vienen del token 
  //customerId: number;
  //customerName: string;
  //customerEmail: string;

  token:string //no se si asi  esta bien  
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}