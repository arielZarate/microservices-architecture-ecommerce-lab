import OrderMapper from './mappers/order.mapper.js';
export default class OrderController {
    orderService;
    //inyeccion de dependencias
    constructor(orderService) {
        this.orderService = orderService;
    }
    // GET /api/orders - List all orders
    listOrder = async (_req, res) => {
        //await this.orderService.getAll
        res.json({ message: 'List all orders - TODO' });
    };
    // GET /api/orders/:id - Get order by ID
    orderById = (req, res) => {
        const { id } = req.params;
        res.json({ message: `Get order ${id} - TODO` });
    };
    // POST /api/orders - Create order
    createOrder = async (req, res) => {
        try {
            const body = req.body;
            const order = OrderMapper.toDomain(body);
            const createdOrder = await this.orderService.create(order);
            res.status(201).json(createdOrder);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
    // PUT /api/orders/:id/status - Update order status
    updateOrder = (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        res.json({ message: 'order status updated - TODO' });
    };
    // DELETE /api/orders/:id - Soft delete order
    deleteOrder = (req, res) => {
        // const { id } = req.params;
        // // TODO: soft delete en la base de datos
        // console.log(`[OrderController] Delete order ${id}`);
        res.status(204).json("Orden eliminada exitosamente");
    };
}
//# sourceMappingURL=order.controller.js.map