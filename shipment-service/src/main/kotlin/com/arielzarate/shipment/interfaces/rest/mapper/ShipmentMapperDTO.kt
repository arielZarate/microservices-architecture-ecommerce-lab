package com.arielzarate.shipment.interfaces.rest.mapper

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentItem
import com.arielzarate.shipment.interfaces.rest.dto.AddressResponseDTO
import com.arielzarate.shipment.interfaces.rest.dto.ShipmentItemResponseDTO
import com.arielzarate.shipment.interfaces.rest.dto.ShipmentResponseDTO
import org.springframework.stereotype.Component

@Component
class ShipmentMapperDTO {

    fun toDTO(shipment: Shipment): ShipmentResponseDTO {
        return ShipmentResponseDTO(
            orderId = shipment.id,
            customerId = shipment.customerId,
            customerName = shipment.customerName,
            status = shipment.status.name,
            trackingCode = shipment.trackingCode,
            address = shipment.address?.let { toAddressDTO(it) },
            items = shipment.items.map { toItemDTO(it) }
        )
    }

    private fun toItemDTO(item: ShipmentItem): ShipmentItemResponseDTO {
        return ShipmentItemResponseDTO(
            productId = item.productId,
            productName = item.productName,
            quantity = item.quantity,
            unitPrice = item.unitPrice
        )
    }

    private fun toAddressDTO(address: com.arielzarate.shipment.domain.model.Address): AddressResponseDTO {
        return AddressResponseDTO(
            address = address.address,
            neighborhood = address.neighborhood,
            city = address.city,
            postalCode = address.postalCode,
            country = address.country
        )
    }
}
