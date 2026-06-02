package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.ports.`in`.AddressService
import com.arielzarate.shipment.domain.ports.out.AddressProvider
import com.arielzarate.shipment.domain.ports.out.ExternalAddressProvider
import org.springframework.stereotype.Service


@Service
class AddressUseCase(
    private val addressProvider: AddressProvider,
    private val externalAddressProvider: ExternalAddressProvider
) : AddressService {
    override fun getAddressByUserId(id: Long): Address {
        val externalAddress = externalAddressProvider.fetchAddressByUserId(id)
        return addressProvider.saveAddress(externalAddress)
    }

}