package com.arielzarate.shipment.domain.model

data class ShipmentItem(
    val productId: Int,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double
)
