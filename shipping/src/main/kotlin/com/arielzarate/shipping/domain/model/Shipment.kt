package com.arielzarate.shipping.domain.model

data class Shipment(
    val id: Long,
    val status: ShipmentStatus,
    val trackingCode: String? = null
)
