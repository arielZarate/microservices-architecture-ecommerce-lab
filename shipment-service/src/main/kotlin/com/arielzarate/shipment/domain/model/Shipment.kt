package com.arielzarate.shipment.domain.model

data class Shipment(
    val id: String,
    val customerId: Long,
    val customerName: String,
    val status: ShipmentStatus,
    val trackingCode: String? = null,
    val address: Address,
    val items: List<ShipmentItem> = emptyList()
)
