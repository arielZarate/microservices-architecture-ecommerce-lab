import OrderStatus from "./enum/orderStatus.js";
import OrderItem from "./orderItem.model.js";
export default class Order {
    private id?;
    private customerId;
    private customerName;
    private customerEmail;
    private totalAmount?;
    private items;
    private status;
    constructor(id: string | undefined, customerId: number, customerName: string, customerEmail: string, items: OrderItem[], totalAmount: number | undefined, status: OrderStatus);
    getId(): string;
    setId(value: string): void;
    getCustomerId(): number;
    setCustomerId(value: number): void;
    getCustomerName(): string;
    setCustomerName(value: string): void;
    getCustomerEmail(): string;
    setCustomerEmail(value: string): void;
    getTotalAmount(): number;
    setTotalAmount(value: number): void;
    getStatus(): OrderStatus;
    setStatus(value: OrderStatus): void;
    toString(): string;
    getItems(): OrderItem[];
    setItems(value: OrderItem[]): void;
}
//# sourceMappingURL=order.model.d.ts.map