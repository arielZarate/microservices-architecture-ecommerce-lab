import { type Request, type Response, type NextFunction } from 'express';
import { HttpError } from '../middlewares/errorHandler';
import { OrderResponseDTO } from './dto/orderResponse.dto';
import { CreateOrderDTO } from './dto/createOrder.dto';
import { OrderStatus } from '../models/enum/orderStatus';
import { UpdateOrderStatusDTO } from './dto/orderStatus.dto';
import { OrderService } from '../services/order/order.service.interface';


export default class OrderController {

  //inyeccion de dependencias
  constructor(private orderService: OrderService) {}

// GET /api/orders - List all orders
 listOrder =async (_req: Request, res: Response): Promise<void> => {
    //await this.orderService.getAll
  res.json({ message: 'List all orders - TODO' });
};

// GET /api/orders/:id - Get order by ID
 orderById = (req: Request, res: Response): void => {
  const { id } = req.params;
  // TODO: obtener de la base de datos
  // throw new HttpError('Orden no encontrada', 404);
  res.json({ message: `Get order ${id} - TODO` });
};

// POST /api/orders - Create order
 createOrder = (req: Request, res: Response): void => {
  const body = req.body as CreateOrderDTO;

  const items=body.items

  // Validaciones
  //if (!body.customerId) {
 //   throw new HttpError('customerId es requerido', 400);
  //}
  //if (!body.customerName) {
  //  throw new HttpError('customerName es requerido', 400);
 // }
  //if (!body.customerEmail) {
  //  throw new HttpError('customerEmail es requerido', 400);
 // }
  if (!body.items || body.items.length === 0) {
    throw new HttpError('La orden debe tener al menos un producto', 400);
  }

  // TODO: guardar en la base de datos
  console.log('[OrderController] createOrder called with:', body);



  res.status(201).json("Orden creada exitosamente");
};

// PUT /api/orders/:id/status - Update order status
 updateOrder = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body as UpdateOrderStatusDTO;

  // // Validar estado
  // const validStatuses = Object.values(OrderStatus);
  // if (!validStatuses.includes(status)) {
  //   throw new HttpError(
  //     `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`,
  //     400
  //   );
  

 
  res.json({ message: 'order status updated - TODO' });
};

// DELETE /api/orders/:id - Soft delete order
 deleteOrder = (req: Request, res: Response): void => {
  // const { id } = req.params;
  // // TODO: soft delete en la base de datos
  // console.log(`[OrderController] Delete order ${id}`);
  res.status(204).json("Orden eliminada exitosamente");
};

}

