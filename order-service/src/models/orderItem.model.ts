export class OrderItem {
  private productId: number = 0;
  private productName: string = "";
  private quantity: number = 0;
  private unitPrice: number = 0;

  constructor(
    productId: number,
    productName: string,
    quantity: number,
    unitPrice: number
  ) {
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  getProductId(): number {
    return this.productId;
  }
  setProductId(value: number): void {
    this.productId = value;
  }

  getProductName(): string {
    return this.productName;
  }
  setProductName(value: string): void {
    this.productName = value;
  }

  getQuantity(): number {
    return this.quantity;
  }
  setQuantity(value: number): void {
    this.quantity = value;
  }

  getUnitPrice(): number {
    return this.unitPrice;
  }
  setUnitPrice(value: number): void {
    this.unitPrice = value;
  }

  toString(): string {
    return `OrderItem(productId=${this.productId}, productName=${this.productName}, quantity=${this.quantity}, unitPrice=${this.unitPrice})`;
  }
}