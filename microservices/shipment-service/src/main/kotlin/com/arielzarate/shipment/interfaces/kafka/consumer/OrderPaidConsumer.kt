package com.arielzarate.shipment.interfaces.kafka.consumer

import com.arielzarate.shipment.domain.model.ShipmentItem
import com.arielzarate.shipment.domain.ports.`in`.ShipmentService
import com.arielzarate.shipment.interfaces.kafka.dto.OrderPaidEvent
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Component

@Component
class OrderPaidConsumer(
    private val shipmentService: ShipmentService
) {
    companion object : CompanionLogger()

    @KafkaListener(topics = ["order-paid"], groupId = "\${spring.kafka.consumer.group-id}")
    fun consume(event: OrderPaidEvent) {
        log.info("Received order-paid event: orderId=${event.orderId}, customerId=${event.customerId}")

        val items = event.items.map { item ->
            ShipmentItem(
                productId = item.productId,
                productName = item.productName,
                quantity = item.quantity,
                unitPrice = item.unitPrice
            )
        }

        shipmentService.createShipment(
            orderId = event.orderId,
            customerId = event.customerId,
            customerName = event.customerName,
            items = items
        )

        log.info("Shipment created for order: ${event.orderId}")
    }
}
