import AddressResponseDTO from '../../controllers/dto/address.response.dto.js';

export default interface AddressService {
    getAddressByCustomerId(customerId: number): Promise<AddressResponseDTO>;
}
