import ItemPrisma from '../model/item.prisma.js';
import OrderItem from '../../models/orderItem.model.js';
export default class ItemMapperRepository {
    static toPrisma(items: OrderItem[]): ItemPrisma[];
    static fromPrisma(items: ItemPrisma[]): OrderItem[];
}
//# sourceMappingURL=item.mapper.d.ts.map