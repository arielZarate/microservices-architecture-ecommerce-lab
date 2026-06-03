package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.ports.`in`.AddressService
import com.arielzarate.shipment.domain.ports.out.AddressProvider
import com.arielzarate.shipment.domain.ports.out.ExternalAddressProvider
import com.arielzarate.shipment.interfaces.error.exception.ShipmentErrorException
import com.arielzarate.shipment.interfaces.error.model.ShipmentError
import org.springframework.stereotype.Service


@Service
class AddressUseCase(
    private val addressProvider: AddressProvider,
    private val externalAddressProvider: ExternalAddressProvider
) : AddressService {

    override fun getAddressByUserId(id: Long): Address {
        val cached = addressProvider.findByCustomerId(id)
        if (cached != null) {
            return cached
        }
        return fetchAndSaveAddress(id)
    }

    private fun fetchAndSaveAddress(customerId: Long): Address {
        try {
            val externalAddress = externalAddressProvider.fetchAddressByUserId(customerId)
            return addressProvider.saveAddress(externalAddress.copy(customerId = customerId))
        } catch (e: Exception) {
            throw ShipmentErrorException(
                ShipmentError.serverError(e)
            )
        }
    }
}