 class OrderItem {
  private id?: string;
  private productId: number;
  private productName?: string | undefined;
  private quantity: number;
  private unitPrice?: number | undefined;

  constructor(

    productId: number,
    quantity: number,
    productName?: string,
    unitPrice?: number,
    id?: string,
  
  ) {
    this.productId = productId;
    this.quantity = quantity;
    this.productName = productName;
    this.unitPrice = unitPrice;
    if (id !== undefined) this.id = id;
   
  }

  getId(): string | undefined {
    return this.id;
  }
  setId(value: string): void {
    this.id = value;
  }

  getProductId(): number {
    return this.productId;
  }
  setProductId(value: number): void {
    this.productId = value;
  }

  setProductName(value: string ): void {
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
  setUnitPrice(value: number ): void {
    this.unitPrice = value;
  }

  toString(): string {
    return `OrderItem(productId=${this.productId}, productName=${this.productName}, quantity=${this.quantity}, unitPrice=${this.unitPrice})`;
  }
}


export default OrderItem;