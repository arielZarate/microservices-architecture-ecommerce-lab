import axios, { AxiosError } from 'axios';
import ProductDTO from './dto/product.dto.js';
import ProductClient from './product.client.interface.js';
import { HttpError } from '../../middlewares/errorHandler.js';

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
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      throw new HttpError(
        `Product ${productId} not found`,
        err.response.status
      );
    }
    throw new HttpError(`Product ${productId} not found`, 503);
  }
}
} 









