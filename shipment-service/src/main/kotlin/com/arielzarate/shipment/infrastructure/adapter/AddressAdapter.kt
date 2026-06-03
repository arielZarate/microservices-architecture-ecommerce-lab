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

    override fun findByCustomerId(customerId: Long): Address? {
        return addressRepository.findAddressByCustomerId(customerId)
            ?.let { AddressMapper.mapToDomain(it) }
    }

    override fun saveAddress(address: Address): Address {
        val existing = addressRepository.findAddressByCustomerId(address.customerId)
        if (existing != null) {
            existing.customerId = address.customerId
            existing.address = address.address
            existing.neighborhood = address.neighborhood
            existing.city = address.city
            existing.postalCode = address.postalCode
            existing.country = address.country
            return AddressMapper.mapToDomain(addressRepository.save(existing))
        }
        val entity = addressRepository.save(AddressMapper.mapToEntity(address))
        return AddressMapper.mapToDomain(entity)
    }
}