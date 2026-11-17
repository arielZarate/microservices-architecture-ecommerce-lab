import ProductDTO from "./dto/product.dto.js";

export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
}

export default interface ProductClient {
  getProductById(id: number, config?: RequestConfig): Promise<ProductDTO>;
}