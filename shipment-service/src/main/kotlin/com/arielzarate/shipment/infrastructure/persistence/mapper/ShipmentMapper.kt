package com.arielzarate.shipment.infrastructure.persistence.mapper

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentStatus
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentEntity
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentStatusEntity
import org.springframework.stereotype.Component

@Component
class ShipmentMapper {

    fun toDomain(entity: ShipmentEntity): Shipment {
        return Shipment(
            id = entity.id,
            status = ShipmentStatus.valueOf(entity.status.name),
            trackingCode = entity.trackingCode
        )
    }

    fun toEntity(domain: Shipment): ShipmentEntity {
        return ShipmentEntity(
            id = domain.id,
            status = ShipmentStatusEntity.valueOf(domain.status.name),
            trackingCode = domain.trackingCode
        )
    }
}
