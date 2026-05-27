declare class OrderItem {
    private id?;
    private orderId?;
    private productId;
    private productName?;
    private quantity;
    private unitPrice?;
    constructor(productId: number, quantity: number, productName?: string, unitPrice?: number, id?: string, orderId?: string);
    getId(): string | undefined;
    setId(value: string): void;
    getOrderId(): string | undefined;
    setOrderId(value: string): void;
    getProductId(): number;
    setProductId(value: number): void;
    setProductName(value: string): void;
    getQuantity(): number;
    setQuantity(value: number): void;
    getProductName(): string;
    getUnitPrice(): number;
    setUnitPrice(value: number): void;
    toString(): string;
}
export default OrderItem;
//# sourceMappingURL=orderItem.model.d.ts.map