import OrderService from './order.service.interface.js';
import Order from '../../models/order.model.js';
import OrderItem from '../../models/orderItem.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
import userContext from '../../context/user.context.js';
import ProductClient from '../product/product.client.interface.js';
import OrderRepository from '../../persistence/order/order.repository.interface.js';

export class OrderServiceImpl implements OrderService {

  constructor(
    private productClient: ProductClient,
    private orderRepository: OrderRepository
  ) {}

  private validateUserContext() {
    const user = userContext.getStore();
    if (!user) {
      throw new Error('User context is missing');
    }
    return user;
  }

  async create(order: Order): Promise<Order> {
    // 1. Validate user context
    const user = this.validateUserContext();

    // 2. Set customer data from context
    order.setCustomerId(user.customerId);
    order.setCustomerName(user.customerName);
    order.setCustomerEmail(user.customerEmail);

    // 3. Validate array items
    if (order.getItems().length === 0) {
      throw new Error('Order must have at least one item.');
    }

    // 4. Fetch each product and enrich items
    for (const item of order.getItems()) {
      const product = await this.productClient.getProductById(item.getProductId());

      if (!product) {
        throw new Error(`Product with ID ${item.getProductId()} not found.`);
      }

      item.setProductName(product.title);
      item.setUnitPrice(product.price);
    }

    // 5. Calculate totalAmount
    const totalAmount = order.getItems().reduce(
      (sum, item) => sum + (item.getQuantity() * item.getUnitPrice()),
      0
    );
    order.setTotalAmount(totalAmount);

    // 6. Save to repository
    const savedOrder = await this.orderRepository.create(order);

    return savedOrder;
  }

  async getAll(): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }

  async getById(id: string): Promise<Order | null> {
    throw new Error('Method not implemented.');
  }

  async getByCustomerId(customerId: number): Promise<Order[]> {
    throw new Error('Method not implemented.');
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}