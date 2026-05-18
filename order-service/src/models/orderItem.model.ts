 class OrderItem {
  private productId:number;
  private productName?: string | undefined;
  private quantity: number;
  private unitPrice?: number | undefined;

  constructor(
    productId: number,
    productName: string | undefined,
    quantity: number,
    unitPrice: number | undefined
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

  setProductName(value: string | undefined): void {
    this.productName = value;
  }

  getQuantity(): number {
    return this.quantity;
  }
  setQuantity(value: number): void {
    this.quantity = value;
  }


  getProductName(): string {
    return this.productName || '';
  }

  getUnitPrice(): number {

    return this.unitPrice || 0;
  }
  setUnitPrice(value: number | undefined): void {
    this.unitPrice = value;
  }

  toString(): string {
    return `OrderItem(productId=${this.productId}, productName=${this.productName}, quantity=${this.quantity}, unitPrice=${this.unitPrice})`;
  }
}


export default OrderItem;