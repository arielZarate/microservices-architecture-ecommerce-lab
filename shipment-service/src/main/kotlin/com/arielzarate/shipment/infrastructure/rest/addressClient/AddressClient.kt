package com.arielzarate.shipment.infrastructure.rest.addressClient

import com.arielzarate.shipment.infrastructure.rest.addressClient.dto.AddressResponse

interface AddressClient {
    fun getAddressByCustomerId(customerId: Long): AddressResponse
}
