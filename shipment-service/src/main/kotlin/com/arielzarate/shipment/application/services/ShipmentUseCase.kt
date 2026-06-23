package com.arielzarate.shipment.application.services

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentItem
import com.arielzarate.shipment.domain.model.ShipmentStatus
import com.arielzarate.shipment.domain.ports.`in`.ShipmentService
import com.arielzarate.shipment.domain.ports.out.ShipmentProvider
import com.arielzarate.shipment.interfaces.error.exception.ShipmentErrorException
import com.arielzarate.shipment.interfaces.error.model.ShipmentError
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service

@Service
class ShipmentUseCase(
    private val provider: ShipmentProvider,
    private val addressUseCase: AddressUseCase,
    private val kafka: KafkaTemplate<String, Any>
) : ShipmentService {

    companion object : CompanionLogger()

    override fun getAllShipments(): List<Shipment> {
        return provider.findAll()
    }

    override fun getShipmentByOrderId(orderId: String): Shipment {
        return provider.findByOrderId(orderId)
            ?: throw ShipmentErrorException(
                ShipmentError.notFoundError("Shipment not found for order: $orderId")
            ) as Throwable
    }

    override fun createShipment(
        orderId: String,
        customerId: Long,
        customerName: String,
        items: List<ShipmentItem>
    ): Shipment {
        val address = addressUseCase.getAddressByUserId(customerId)

        val shipment = Shipment(
            id = orderId,
            customerId = customerId,
            customerName = customerName,
            status = ShipmentStatus.PREPARING,
            address = address,
            items = items
        )
        val saved = provider.save(shipment)
        log.info("Processing shipment PREPARING..")

        //EMIT EVENT : ORDER-PREPARING
        kafka.send(
            "order-preparing",
            mapOf(
                "eventType" to "ORDER_PREPARING",
                "orderId" to saved.id,
                "customerId" to saved.customerId,
                "customerName" to saved.customerName,
                "status" to saved.status
            )
        )
        log.info("Published order-preparing for order: ${saved.id}")

        return saved
    }
}
