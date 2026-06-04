package com.arielzarate.shipment.application.services.step

import com.arielzarate.shipment.domain.model.ShipmentStatus
import com.arielzarate.shipment.domain.ports.`in`.StatusStep
import com.arielzarate.shipment.domain.ports.out.ShipmentProvider
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.springframework.core.annotation.Order
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

@Component
@Order(1)
class PreparingToShippedStep(
    private val provider: ShipmentProvider,
    private val kafka: KafkaTemplate<String, Any>
) : StatusStep {

    companion object : CompanionLogger()

    override fun execute() {
        val shipments = provider.findByStatus(ShipmentStatus.PREPARING)
        if (shipments.isEmpty()) return

        log.info("Processing {} shipments from PREPARING to SHIPPED", shipments.size)

        shipments.forEach { shipment ->
            val updated = shipment.copy(status = ShipmentStatus.SHIPPED)
            provider.save(updated)
            kafka.send("order-shipped", mapOf(
                "eventType" to "ORDER_SHIPPED",
                "orderId" to updated.id,
                "customerId" to updated.customerId,
                "customerName" to updated.customerName,
                "status"  to updated.status
            ))
            log.info("Shipment {} transitioned PREPARING → SHIPPED", updated.id)
        }
    }
}
