package com.arielzarate.shipment.domain.ports.`in`

import com.arielzarate.shipment.domain.model.Address

interface AddressService {
    fun getAddressByUserId(id: Long): Address
}