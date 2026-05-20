import ProductDTO from './dto/product.dto.js';
import ProductClient from './product.client.interface.js';
export default class ProductClientService implements ProductClient {
    private baseURL;
    constructor(baseURL: string);
    getProductById(productId: number): Promise<ProductDTO>;
}
//# sourceMappingURL=product.client.service.d.ts.map