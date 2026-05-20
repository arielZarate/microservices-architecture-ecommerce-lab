export default class Order {
    id;
    customerId;
    customerName;
    customerEmail;
    totalAmount;
    items;
    status;
    constructor(id, customerId, customerName, customerEmail, items, totalAmount, status) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.totalAmount = totalAmount;
        this.items = items;
        this.status = status;
    }
    getId() {
        return this.id || '';
    }
    setId(value) {
        this.id = value;
    }
    getCustomerId() {
        return this.customerId;
    }
    setCustomerId(value) {
        this.customerId = value;
    }
    getCustomerName() {
        return this.customerName;
    }
    setCustomerName(value) {
        this.customerName = value;
    }
    getCustomerEmail() {
        return this.customerEmail;
    }
    setCustomerEmail(value) {
        this.customerEmail = value;
    }
    getTotalAmount() {
        return this.totalAmount || 0;
    }
    setTotalAmount(value) {
        this.totalAmount = value;
    }
    getStatus() {
        return this.status;
    }
    setStatus(value) {
        this.status = value;
    }
    toString() {
        return `Order(id=${this.id}, customerId=${this.customerId}, items=${this.items.length}, totalAmount=${this.totalAmount}, status=${this.status})`;
    }
    //======items[]=========
    getItems() {
        return this.items;
    }
    setItems(value) {
        this.items = value;
    }
}
//# sourceMappingURL=order.model.js.map