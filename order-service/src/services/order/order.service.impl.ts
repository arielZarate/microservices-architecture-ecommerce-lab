import OrderService from './order.service.interface.js';
import Order from '../../models/order.model.js';
import OrderItem from '../../models/orderItem.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
import userContext from '../../context/user.context.js';
import ProductClient from '../product/product.client.interface.js';
import OrderRepository from '../../persistence/order/order.repository.interface.js';
import ProductDTO from '../product/dto/product.dto.js';

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

  async create(order: Order): Promise<any> {
    // 1. Validate user context
    const user = this.validateUserContext();

    // 2. Set customer data from context
    order.setCustomerId(user.id);
    order.setCustomerName(user.name);
    order.setCustomerEmail(user.email);
  

   // 4. Fetch each product and enrich items
    const items = order.getItems();


    // 3. Validate array items
    if (items.length === 0) {
      throw new Error('Order must have at least one item.');
    }

 

    const products: ProductDTO[] = await Promise.all(
      items.map(item => this.productClient.getProductById(item.getProductId())
    ));  


     items.forEach((item, index) => {
        const product= products[index] as ProductDTO;
       if (!product) {
        throw new Error(`Product with ID ${products[index]}  not found.`);
      } 
       item.setProductName(product.title);
       item.setUnitPrice(product.price);
       return item;
     });
     

    // 5. Calculate totalAmount
    const totalAmount = items.reduce(
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