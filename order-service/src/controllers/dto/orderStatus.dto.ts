import {OrderStatus} from '../../models/enum/orderStatus'


// DTO para actualizar estado
export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}