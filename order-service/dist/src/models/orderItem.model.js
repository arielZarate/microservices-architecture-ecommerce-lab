class OrderItem {
    id;
    orderId;
    productId;
    productName;
    quantity;
    unitPrice;
    constructor(productId, quantity, productName, unitPrice, id, orderId) {
        this.productId = productId;
        this.quantity = quantity;
        this.productName = productName;
        this.unitPrice = unitPrice;
        if (id !== undefined)
            this.id = id;
        if (orderId !== undefined)
            this.orderId = orderId;
    }
    getId() {
        return this.id;
    }
    setId(value) {
        this.id = value;
    }
    getOrderId() {
        return this.orderId;
    }
    setOrderId(value) {
        this.orderId = value;
    }
    getProductId() {
        return this.productId;
    }
    setProductId(value) {
        this.productId = value;
    }
    setProductName(value) {
        this.productName = value;
    }
    getQuantity() {
        return this.quantity;
    }
    setQuantity(value) {
        this.quantity = value;
    }
    getProductName() {
        return this.productName || '';
    }
    getUnitPrice() {
        return this.unitPrice || 0;
    }
    setUnitPrice(value) {
        this.unitPrice = value;
    }
    toString() {
        return `OrderItem(productId=${this.productId}, productName=${this.productName}, quantity=${this.quantity}, unitPrice=${this.unitPrice})`;
    }
}
export default OrderItem;
//# sourceMappingURL=orderItem.model.js.map