import ItemPrisma from '../model/item.prisma.js';
import OrderItem from '../../models/orderItem.model.js';

export default class ItemMapperRepository {
  static toPrisma(items: OrderItem[]): ItemPrisma[] {
    return items.map(item => ({
      productId: item.getProductId(),
      productName: item.getProductName() || null,
      quantity: item.getQuantity(),
      unitPrice: item.getUnitPrice()
    }));
  }

  static fromPrisma(items: ItemPrisma[]): OrderItem[] {
    return items.map(
      item =>
        new OrderItem(
          item.productId,
          item.quantity,
          item.productName || undefined,
          Number(item.unitPrice),
          item.id,
          item.orderId
        )
    );
  }
}