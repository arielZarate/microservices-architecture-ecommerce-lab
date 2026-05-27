 type OrderPrismaResponse = {
  id: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  items: {
    id: string;
    orderId: string;
    productId: number;
    productName: string | null;
    quantity: number;
    unitPrice: number;
  }[];
};

export default OrderPrismaResponse