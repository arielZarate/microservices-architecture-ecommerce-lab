package com.arielzarate.shipment.interfaces.rest.mapper

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.interfaces.rest.dto.ShipmentResponseDTO
import org.springframework.stereotype.Component

@Component
class ShipmentMapperDTO {

    fun toDTO(shipment: Shipment): ShipmentResponseDTO {
        return ShipmentResponseDTO(
            orderId = shipment.id,
            status = shipment.status.name,
            trackingCode = shipment.trackingCode
        )
    }
}
