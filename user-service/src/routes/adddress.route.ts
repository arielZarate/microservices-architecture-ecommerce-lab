import { Router } from 'express';
import AddressController from '../controllers/address.controller.js';
import AddressService from '../services/address/address.service.interface.js';
import AddressServiceImpl from '../services/address/address.service.impl.js';
import UserRepositoryImpl from '../persistence/user/user.repository.impl.js';
import validateHeader from '../middlewares/validatorHeader.js';

const userRepository = new UserRepositoryImpl();
const addressService: AddressService = new AddressServiceImpl(userRepository);
const addressController = new AddressController(addressService);

const router = Router();

router.get('/:customerId',validateHeader, addressController.getAddressByCustomerId.bind(addressController));

export default router;