package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.ports.`in`.ShipmentService
import com.arielzarate.shipment.domain.ports.out.ShipmentProvider
import com.arielzarate.shipment.interfaces.error.exception.ShipmentErrorException
import com.arielzarate.shipment.interfaces.error.model.ShipmentError
import org.springframework.stereotype.Service

@Service
class ShipmentUseCase(
    private val provider: ShipmentProvider
) : ShipmentService {

    override fun getAllShipments(): List<Shipment> {
        return provider.findAll()
    }

    override fun getShipmentByOrderId(orderId: Long): Shipment {
        return provider.findByOrderId(orderId)
            ?: throw ShipmentErrorException(
                ShipmentError.notFoundError("Shipment not found for order: $orderId")
            )
    }
}
