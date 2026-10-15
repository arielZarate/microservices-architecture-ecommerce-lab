import UserRepository from '../../persistence/user/user.repository.interface.js';
import AddressService from './address.service.interface.js';
import AddressResponseDTO from '../../controllers/dto/address.response.dto.js';
import { HttpError } from '../../middlewares/errorHandler.js';

export default class AddressServiceImpl implements AddressService {

  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async getAddressByCustomerId(customerId: number): Promise<AddressResponseDTO> {
    const addressData = await this.userRepository.findAddressByCustomerId(customerId);
    if (!addressData) {
      throw new HttpError('Customer not found', 404);
    }

    return {
      customerId: addressData.id,
      address: addressData.address,
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      postalCode: addressData.postalCode,
      country: addressData.country,
    };
  }
}
