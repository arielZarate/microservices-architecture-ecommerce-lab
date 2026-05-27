import OrderService from './order.service.interface.js';
import Order from '../../models/order.model.js';
import OrderItem from '../../models/orderItem.model.js';
import OrderStatus from '../../models/enum/orderStatus.js';
import userContext from '../../context/user.context.js';
import ProductClient from '../product/product.client.interface.js';
import OrderRepository from '../../persistence/order/order.repository.interface.js';
import ProductDTO from '../product/dto/product.dto.js';
import { HttpError } from '../../middlewares/errorHandler.js';


class OrderServiceImpl implements OrderService {

  constructor(
    private productClient: ProductClient,
    private orderRepository: OrderRepository
  ) {}



  //===============create order==============================
  async create(order: Order): Promise<Order> {
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
    return await this.orderRepository.create(order);
   
  }




  //====================get all=========================
  async getAll(status?: string): Promise<Order[]> {
    const orders=await this.orderRepository.getAll(status);
    return orders;
  }




  //====================get by customer=====================
  async getByCustomerId(): Promise<Order[]> {
    const user = this.validateUserContext();
    return this.orderRepository.getByCustomerId(user.id);
  }




  //================get by order=============================
  async getById(id: string): Promise<Order> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new HttpError(`Order ${id} not found`, 404);
    }
    return order; 

  }

 
  //====================update status=========================
  async updateStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.getById(id);
    if (!order) {
      throw new HttpError(`Order ${id} not found`, 404);
    }

    const currentStatus = order.getStatus();
    if (!this.isValidTransition(currentStatus, newStatus)) {
      throw new HttpError(
        `Invalid transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }

    return this.orderRepository.updateStatus(id, newStatus);
  }





  //=========PRIVATE METHODS====================

  private validateUserContext() {
    const user = userContext.getStore();
    if (!user) {
      throw new Error('User context is missing');
    }
    return user;
  }

  private isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [],
      [OrderStatus.CANCELLED]: [],
    };
    return transitions[current]?.includes(next) ?? false;
  }

}


export default OrderServiceImpl