import { type Request, type Response, type NextFunction } from 'express';
import { HttpError } from '../middlewares/errorHandler.js';
import { OrderResponseDTO } from './dto/orderResponse.dto.js';
import  CreateOrderDTO  from './dto/createOrder.dto.js';
import  OrderService  from '../services/order/order.service.interface.js';
import updateStatusDTO from './dto/updateOrder.dto.js';
import OrderMapper from './mappers/order.mapper.js';
import logger from '../config/logger.js';

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
  res.json({ message: `Get order ${id} - TODO` });
};

// POST /api/orders - Create order
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info("Request POST create orders")
      const body = req.body as CreateOrderDTO;
      const order = OrderMapper.toDomain(body);
      const createdOrder = await this.orderService.create(order);
      logger.info(`Order created successfully: ${createdOrder.getId()}`);
    res.status(201).json({
      id: createdOrder.getId()
    });

    } catch (error : any) {
      logger.error(`Error creating order: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  };

// PUT /api/orders/:id/status - Update order status
 updateOrder = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body as updateStatusDTO;

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

