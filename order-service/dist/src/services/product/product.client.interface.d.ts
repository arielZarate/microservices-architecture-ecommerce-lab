import ProductDTO from "./dto/product.dto.js";
export default interface ProductClient {
    getProductById(id: number): Promise<ProductDTO>;
}
//# sourceMappingURL=product.client.interface.d.ts.map