package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.domain.model.Address
import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentStatus
import com.arielzarate.shipment.domain.ports.`in`.ShipmentService
import com.arielzarate.shipment.domain.ports.out.ShipmentProvider
import com.arielzarate.shipment.interfaces.error.exception.ShipmentErrorException
import com.arielzarate.shipment.interfaces.error.model.ShipmentError
import org.springframework.stereotype.Service

@Service
class ShipmentUseCase(
    private val provider: ShipmentProvider,
    private val addressUseCase: AddressUseCase
) : ShipmentService {

    override fun getAllShipments(): List<Shipment> {
        return provider.findAll()
    }

    override fun getShipmentByOrderId(orderId: String): Shipment {
        return provider.findByOrderId(orderId)
            ?: throw ShipmentErrorException(
                ShipmentError.notFoundError("Shipment not found for order: $orderId")
            )
    }

    override fun createShipment(orderId: String): Shipment {

        //data dee kafka tengo que tener la data con el customerId
        val customerId = 1245L
        //buscamos o valiamos la direccion

        val address = addressUseCase.getAddressByUserId(customerId)

        val shipment = Shipment(
            id = orderId,
            status = ShipmentStatus.PREPARING,
            address = address
        )
        return provider.save(shipment)
    }
}
