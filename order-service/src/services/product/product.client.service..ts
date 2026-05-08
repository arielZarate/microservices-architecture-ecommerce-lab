import axios from 'axios';

// lo que espero de products
export interface ProductFromService {
  productId: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export const productService = {
  async getProduct(productId: number): Promise<ProductFromService> {
    const url = `${process.env.PRODUCT_SERVICE_URL}/products/${productId}`;
    const response = await axios.get<ProductFromService>(url);
    return response.data;
  }
};