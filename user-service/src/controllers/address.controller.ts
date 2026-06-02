
import logger from '../config/logger.js';
import AddressService from '../services/address/address.service.interface.js';
import AddressResponseDTO from './dto/address.response.dto.js';
import { Request, Response, NextFunction } from 'express';  


export default class AddressController {

  constructor(
    private readonly addressService: AddressService
  ) {}

    getAddressByCustomerId = async (req: Request, res: Response<AddressResponseDTO>, next: NextFunction): Promise<void> => {
    try {
      const customerId = Number(req.params.customerId);
      logger.info(`Received request to get address for customer ID: ${customerId}`);
      const result: AddressResponseDTO = await this.addressService.getAddressByCustomerId(customerId);
      res.status(200).json(result);
    } catch (error: unknown) {
      logger.error('Error occurred while fetching address');
      next(error);
    }
  };


}