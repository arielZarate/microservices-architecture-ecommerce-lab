import { type Request, type Response } from 'express';
import OrderService from '../services/order/order.service.interface.js';
export default class OrderController {
    private orderService;
    constructor(orderService: OrderService);
    listOrder: (_req: Request, res: Response) => Promise<void>;
    orderById: (req: Request, res: Response) => void;
    createOrder: (req: Request, res: Response) => Promise<void>;
    updateOrder: (req: Request, res: Response) => void;
    deleteOrder: (req: Request, res: Response) => void;
}
//# sourceMappingURL=order.controller.d.ts.map