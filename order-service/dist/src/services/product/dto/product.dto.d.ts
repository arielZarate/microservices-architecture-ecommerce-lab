export default interface ProductDTO {
    productId: number;
    title: string;
    price: number;
    description: string;
    categoryId: string;
    active: boolean;
    imageUrl: string;
    rating: {
        rate: number;
        count: number;
    };
}
//# sourceMappingURL=product.dto.d.ts.map