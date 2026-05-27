import userContext from '../../context/user.context.js';
export class OrderServiceImpl {
    productClient;
    orderRepository;
    constructor(productClient, orderRepository) {
        this.productClient = productClient;
        this.orderRepository = orderRepository;
    }
    validateUserContext() {
        const user = userContext.getStore();
        if (!user) {
            throw new Error('User context is missing');
        }
        return user;
    }
    async create(order) {
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
        const products = await Promise.all(items.map(item => this.productClient.getProductById(item.getProductId())));
        items.forEach((item, index) => {
            const product = products[index];
            if (!product) {
                throw new Error(`Product with ID ${products[index]}  not found.`);
            }
            item.setProductName(product.title);
            item.setUnitPrice(product.price);
            console.log('precio unitario', item.getUnitPrice);
            console.log('cantidad', item.getQuantity());
            return item;
        });
        // 5. Calculate totalAmount
        const totalAmount = items.reduce((sum, item) => sum + (item.getQuantity() * item.getUnitPrice()), 0);
        order.setTotalAmount(totalAmount);
        // 6. Save to repository
        const savedOrder = await this.orderRepository.create(order);
        console.log('Saved order:', savedOrder);
        return savedOrder;
    }
    async getAll() {
        throw new Error('Method not implemented.');
    }
    async getById(id) {
        throw new Error('Method not implemented.');
    }
    async getByCustomerId(customerId) {
        throw new Error('Method not implemented.');
    }
    async updateStatus(id, status) {
        throw new Error('Method not implemented.');
    }
    async delete(id) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=order.service.impl.js.map