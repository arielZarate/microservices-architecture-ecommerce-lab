import OrderStatus  from "./enum/orderStatus.js";
import  OrderItem  from "./orderItem.model.js";

export default class Order {
   private id: string;
  private customerId: number;
  private customerName: string;
  private customerEmail: string;
  private items: OrderItem[];
  private totalAmount: number;
  private status: OrderStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;


  constructor(
    id: string,
    customerId: number,
    customerName: string,
    customerEmail: string,
    items: OrderItem[],
    totalAmount: number,
    status: OrderStatus
  ) {
    this.id = id;
    this.customerId = customerId;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.items = items;
    this.totalAmount = totalAmount;
    this.status = status;

    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.deletedAt = null;
  }

  getId(): string {
    return this.id;
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

 //======items[]=========

  getItems(): OrderItem[] {
    return this.items;
  }
  setItems(value: OrderItem[]): void {
    this.items = value;
  }

  //===================
  getTotalAmount(): number {
    return this.totalAmount;
  }
  setTotalAmount(value: number): void {
    this.totalAmount = value;
  }


  //status
  getStatus(): OrderStatus {
    return this.status;
  }
  setStatus(value: OrderStatus): void {
    this.status = value;
  }

  public canceled(){
    this.status=OrderStatus.CANCELLED
    this.updatedAt= new Date()
  }


//====================

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
  setUpdatedAt(value: Date): void {
    this.updatedAt = value;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }
  setDeletedAt(value: Date | null): void {
    this.deletedAt = value;
  }

  toString(): string {
    return `Order(id=${this.id}, customerId=${this.customerId}, customerName=${this.customerName}, items=${this.items.length}, totalAmount=${this.totalAmount}, status=${this.status})`;
  }


}