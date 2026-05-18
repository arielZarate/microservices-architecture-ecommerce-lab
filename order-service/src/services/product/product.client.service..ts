import axios from 'axios';
import ProductDTO from './dto/product.dto.js';
import ProductClient from './product.client.interface.js';

export default class ProductClientService implements ProductClient {

  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = `${process.env.PRODUCT_SERVICE_URL}`;
  }
 
    async getProductById(productId: number): Promise<ProductDTO> {
    const url = `${this.baseURL}/products/${productId}`;
    const response = await axios.get<ProductDTO>(url);
    return response.data;
  }


} 









