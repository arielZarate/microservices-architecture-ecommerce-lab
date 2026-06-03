import axios, { AxiosError } from 'axios';
import ProductDTO from './dto/product.dto.js';
import ProductClient, { RequestConfig } from './product.client.interface.js';
import { HttpError } from '../../middlewares/errorHandler.js';
import logger from '../../config/logger.js';

export default class ProductClientService implements ProductClient {

  private baseURL: string;
  private defaultTimeout: number;
  private apiKey: string;
  private deviceId: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultTimeout = Number(process.env.TIMEOUT) || 5000;
    this.apiKey = process.env.API_KEY as string;
    this.deviceId = process.env.DEVICE_ID as string;
  }

async getProductById(productId: number, config?: RequestConfig): Promise<ProductDTO> {
  try {
    const url = `${this.baseURL}/products/${productId}`;

    const axiosConfig: Record<string, unknown> = {
      timeout: config?.timeout ?? this.defaultTimeout,
      headers: {
        'X-Middleware-ApiKey': this.apiKey,
        'X-Middleware-DeviceId': this.deviceId,
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









