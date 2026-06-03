package com.arielzarate.shipment.infrastructure.persistence.mapper

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentItem
import com.arielzarate.shipment.domain.model.ShipmentStatus
import com.arielzarate.shipment.infrastructure.persistence.entity.AddressEntity
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentEntity
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentItemEntity
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentStatusEntity
import org.springframework.stereotype.Component

@Component
class ShipmentMapper {

    fun toDomain(entity: ShipmentEntity): Shipment {
        return Shipment(
            id = entity.id,
            customerId = entity.customerId,
            customerName = entity.customerName,
            status = ShipmentStatus.valueOf(entity.status.name),
            trackingCode = entity.trackingCode,
            address = entity.address?.let { toAddressDomain(it) } as Address,
            items = entity.items.map { toItemDomain(it) }
        )
    }

    fun toEntity(domain: Shipment): ShipmentEntity {
        return ShipmentEntity(
            id = domain.id,
            customerId = domain.customerId,
            customerName = domain.customerName,
            status = ShipmentStatusEntity.valueOf(domain.status.name),
            trackingCode = domain.trackingCode,
            address = toAddressEntity(domain.address),
            items = domain.items.map { toItemEntity(it) }.toMutableList()
        )
    }

    companion object {
        fun toItemEntity(item: ShipmentItem): ShipmentItemEntity {
            return ShipmentItemEntity(
                productId = item.productId,
                productName = item.productName,
                quantity = item.quantity,
                unitPrice = item.unitPrice
            )
        }

        fun toItemDomain(entity: ShipmentItemEntity): ShipmentItem {
            return ShipmentItem(
                productId = entity.productId,
                productName = entity.productName,
                quantity = entity.quantity,
                unitPrice = entity.unitPrice
            )
        }
    }

    private fun toAddressDomain(entity: AddressEntity): Address {
        return Address(
            address = entity.address,
            neighborhood = entity.neighborhood,
            city = entity.city,
            postalCode = entity.postalCode,
            country = entity.country
        )
    }

    private fun toAddressEntity(domain: Address): AddressEntity {
        return AddressEntity(
            address = domain.address,
            neighborhood = domain.neighborhood,
            city = domain.city,
            postalCode = domain.postalCode,
            country = domain.country
        )
    }
}
