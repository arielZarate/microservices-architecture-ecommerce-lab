package com.arielzarate.shipment.infrastructure.adapter

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.ports.out.AddressProvider
import com.arielzarate.shipment.infrastructure.adapter.mapper.AddressMapper
import com.arielzarate.shipment.infrastructure.persistence.repository.AddressRepository
import org.springframework.stereotype.Component


@Component
class AddressAdapter(
    private val addressRepository: AddressRepository
) : AddressProvider {

    override fun saveAddress(address: Address): Address {
        val entity = addressRepository.save(AddressMapper.mapToEntity(address))
        return AddressMapper.mapToDomain(entity)
    }
}