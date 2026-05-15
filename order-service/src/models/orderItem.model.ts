 class OrderItem {
  private productId: string;
  private productName: string;
  private quantity: number;
  private unitPrice: number;

  constructor(
    productId: string,
    productName: string,
    quantity: number,
    unitPrice: number
  ) {
    this.productId = productId;
    this.productName = productName;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }

  getProductId(): string {
    return this.productId;
  }
  setProductId(value: string): void {
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


export default OrderItem;