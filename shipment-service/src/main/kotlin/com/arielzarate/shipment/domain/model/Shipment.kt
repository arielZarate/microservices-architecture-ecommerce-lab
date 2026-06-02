package com.arielzarate.shipment.domain.model

data class Shipment(
    val id: String,
    val status: ShipmentStatus,
    val trackingCode: String? = null,
    val address: Address
)
