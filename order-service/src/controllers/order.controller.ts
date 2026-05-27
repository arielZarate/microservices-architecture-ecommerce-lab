import { type Request, type Response, type NextFunction } from 'express';
import OrderResponseDTO  from './dto/orderResponse.dto.js';
import  CreateOrderDTO  from './dto/createOrder.dto.js';
import  OrderService  from '../services/order/order.service.interface.js';
import OrderMapper from './mappers/order.mapper.js';
import logger from '../config/logger.js';
import OrderStatus from '../models/enum/orderStatus.js';
import OrderStatusDTO from './dto/status.order.dto.js';

export default class OrderController {

  constructor(private orderService: OrderService) {}

// GET /api/orders - List all orders (optional ?status=PENDING)
  listOrder =async (req: Request, res: Response<Array<OrderResponseDTO>> ): Promise<void> => {
  const status = req.query.status as string | undefined;
  logger.info(`Request GET orders${status ? ` filter by ${status}` : ''}`);
  const list=  await  this.orderService.getAll(status);
  res.status(200).json(list.map(order => OrderMapper.toDTO(order)));
};

// GET /api/orders/my - Get my orders
 myOrders = async (_req: Request, res: Response<Array<OrderResponseDTO>>, next: NextFunction): Promise<void> => {
  try {
    logger.info("Request GET my orders");
    const orders = await this.orderService.getByCustomerId();
    res.status(200).json(orders.map(o => OrderMapper.toDTO(o)));
  } catch (error: unknown) {
    next(error);
  }
};

// GET /api/orders/:id - Get order by ID
 orderById = async(req: Request, res: Response<OrderResponseDTO>, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    logger.info(`Request GET order by id: ${id}`);
    const order = await this.orderService.getById(id);
    res.status(200).json(OrderMapper.toDTO(order));
  } catch (error: unknown) {
    next(error);
  }
};

// POST /api/orders - Create order
  createOrder = async (req: Request, res: Response<OrderResponseDTO>, next: NextFunction): Promise<void> => {
    try {
      logger.info("Request POST create orders")
      const body = req.body as CreateOrderDTO;
      const createdOrder = await this.orderService.create(OrderMapper.toDomain(body));
      logger.info(`Order created successfully: ${createdOrder.getId()}`);
       res.status(201).json(OrderMapper.toDTO(createdOrder));
    } catch (error: unknown) {
      next(error);
    }
  };

// PUT /api/orders/:id/status - Update order status
 updateOrder = async (req: Request, res: Response<OrderResponseDTO>, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body as { status: OrderStatusDTO };
    const domainStatus = status as unknown as OrderStatus;
    const updatedOrder = await this.orderService.updateStatus(id, domainStatus);
    logger.info(`Order ${id} marked ${status} `);
    res.json(OrderMapper.toDTO(updatedOrder));
  } catch (error: unknown) {
    next(error);
  }
};

}

