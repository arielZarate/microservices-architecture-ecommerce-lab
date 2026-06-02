package com.arielzarate.shipment.infrastructure.adapter

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.ports.out.ExternalAddressProvider
import com.arielzarate.shipment.infrastructure.adapter.mapper.AddressMapper
import com.arielzarate.shipment.infrastructure.rest.addressClient.AddressClient
import org.springframework.stereotype.Component

@Component
class ExternalAddressAdapter(
    private val addressClient: AddressClient
) : ExternalAddressProvider {

    override fun fetchAddressByUserId(id: Long): Address {
        val response = addressClient.getAddressByCustomerId(id)
        return AddressMapper.mapToDomainOfClient(response)
    }
}
