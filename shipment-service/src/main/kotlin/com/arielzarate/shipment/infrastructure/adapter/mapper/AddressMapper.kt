package com.arielzarate.shipment.infrastructure.adapter.mapper

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.infrastructure.persistence.entity.AddressEntity
import com.arielzarate.shipment.infrastructure.rest.addressClient.dto.AddressResponse
import org.springframework.stereotype.Component


@Component
class AddressMapper {
    companion object {
        fun mapToDomainOfClient(obj: AddressResponse): Address {
            return Address(
                customerId = obj.customerId,
                address = obj.address,
                neighborhood = obj.neighborhood,
                city = obj.city,
                postalCode = obj.postalCode,
                country = obj.country
            )
        }

        fun mapToDomain(obj: AddressEntity): Address {
            return Address(
                id = obj.id,
                customerId = obj.customerId,
                address = obj.address,
                neighborhood = obj.neighborhood,
                city = obj.city,
                postalCode = obj.postalCode,
                country = obj.country
            )
        }

        fun mapToEntity(domain: Address): AddressEntity {
            return AddressEntity(
                id = domain.id,
                customerId = domain.customerId,
                address = domain.address,
                neighborhood = domain.neighborhood,
                city = domain.city,
                postalCode = domain.postalCode,
                country = domain.country
            )
        }
    }
}