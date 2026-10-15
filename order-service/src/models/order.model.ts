import OrderStatus  from "./enum/orderStatus.js";
import  OrderItem  from "./orderItem.model.js";

export default class Order {
  private id?: string | undefined;
  private customerId: number;
  private customerName: string;
  private customerEmail: string;
  private totalAmount?: number | undefined;
  private items: OrderItem[];
  private status: OrderStatus;

  constructor(
    id: string | undefined,
    customerId: number,
    customerName: string,
    customerEmail: string,
    items: OrderItem[],
    totalAmount: number | undefined,
    status: OrderStatus
  ) {
    this.id = id;
    this.customerId = customerId;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.totalAmount = totalAmount;
    this.items = items;
    this.status = status;
  }

  getId(): string {
    return this.id || '';
  }
  setId(value: string): void {
    this.id = value;
  }

  getCustomerId(): number {
    return this.customerId;
  }
  setCustomerId(value: number): void {
    this.customerId = value;
  }

  getCustomerName(): string {
    return this.customerName;
  }
  setCustomerName(value: string): void {
    this.customerName = value;
  }

  getCustomerEmail(): string {
    return this.customerEmail;
  }
  setCustomerEmail(value: string): void {
    this.customerEmail = value;
  }

  getTotalAmount(): number {
    return this.totalAmount || 0;
  }
  setTotalAmount(value: number): void {
    this.totalAmount = value;
  }

  getStatus(): OrderStatus {
    return this.status;
  }
  setStatus(value: OrderStatus): void {
    this.status = value;
  }

  toString(): string {
    return `Order(id=${this.id}, customerId=${this.customerId}, items=${this.items.length}, totalAmount=${this.totalAmount}, status=${this.status})`;
  }

 //======items[]=========

  getItems(): OrderItem[] {
    return this.items;
  }
  setItems(value: OrderItem[]): void {
    this.items = value;
  }

}