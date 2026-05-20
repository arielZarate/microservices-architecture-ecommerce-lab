import axios from 'axios';
import ProductDTO from './dto/product.dto.js';
import ProductClient from './product.client.interface.js';

export default class ProductClientService implements ProductClient {

  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
 
async getProductById(productId: number): Promise<ProductDTO> {
  try {
    const url = `${this.baseURL}/products/${productId}`;
    const response = await axios.get<ProductDTO>(url);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(`Product ${productId} not found`);
  }
}
} 









