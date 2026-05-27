import axios, { AxiosError } from 'axios';
import ProductDTO from './dto/product.dto.js';
import ProductClient, { RequestConfig } from './product.client.interface.js';
import { HttpError } from '../../middlewares/errorHandler.js';
import tokenContext from '../../context/token.context.js';
import logger from '../../config/logger.js';

export default class ProductClientService implements ProductClient {

  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultTimeout = Number(process.env.TIMEOUT) || 5000;
  }

async getProductById(productId: number, config?: RequestConfig): Promise<ProductDTO> {
  try {
    const url = `${this.baseURL}/products/${productId}`;
    const token = tokenContext.getStore();

    const axiosConfig: Record<string, unknown> = {
      timeout: config?.timeout ?? this.defaultTimeout,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...config?.headers,
      },
    };

    logger.info(`[PRODUCTS-SERVICE] Calling GET ${url}`);
    const response = await axios.get<ProductDTO>(url, axiosConfig);
    logger.info(`[PRODUCTS-SERVICE] Response status ${response.status}`);
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









