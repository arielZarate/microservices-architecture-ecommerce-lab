package com.arielzarate.shipment.domain.ports.out

import com.arielzarate.shipment.domain.model.Address

interface AddressProvider {
    fun saveAddress(address: Address): Address
}