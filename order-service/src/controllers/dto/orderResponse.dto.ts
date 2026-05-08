import { UUID } from "node:crypto";
import { OrderStatus } from "../../models/enum/orderStatus";
import { OrderItem } from "../../models/orderItem.model";


export interface OrderResponseDTO {
  id: UUID;

  //estos datos vienen del token 
  //customerId: number;
  //customerName: string;
  //customerEmail: string;

  token:String //no se si asi  esta bien  
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}