package com.arielzarate.shipment.interfaces.kafka.dto

data class
OrderPaidEvent(
    val eventType: String,
    val orderId: String,
    val customerId: Long,
    val customerName: String,
    val customerEmail: String,
    val items: List<OrderPaidItem>
)

data class OrderPaidItem(
    val productId: Int,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double
)
