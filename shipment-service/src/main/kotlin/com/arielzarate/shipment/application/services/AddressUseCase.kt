package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.ports.`in`.AddressService
import com.arielzarate.shipment.domain.ports.out.AddressProvider
import com.arielzarate.shipment.domain.ports.out.ExternalAddressProvider
import com.arielzarate.shipment.infrastructure.adapter.mapper.AddressMapper
import com.arielzarate.shipment.infrastructure.persistence.repository.AddressRepository
import com.arielzarate.shipment.interfaces.error.exception.ShipmentErrorException
import com.arielzarate.shipment.interfaces.error.model.ShipmentError
import org.springframework.stereotype.Service


@Service
class AddressUseCase(
    private val addressProvider: AddressProvider,
    private val externalAddressProvider: ExternalAddressProvider,
    private val addressRepository: AddressRepository
) : AddressService {

    override fun getAddressByUserId(id: Long): Address {
        val entity = addressRepository.findAddressByCustomerId(id)
        if (entity != null) {
            return AddressMapper.mapToDomain(entity)
        }
        return fetchAndSaveAddress(id)
    }

    private fun fetchAndSaveAddress(customerId: Long): Address {
        try {
            val externalAddress = externalAddressProvider.fetchAddressByUserId(customerId)
            return addressProvider.saveAddress(externalAddress)
        } catch (e: Exception) {
            throw ShipmentErrorException(
                ShipmentError.serverError(e)
            )
        }
    }
}