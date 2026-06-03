package com.arielzarate.shipment.interfaces.rest.dto

import io.swagger.v3.oas.annotations.media.Schema

//@Schema(description = "Shipment response DTO")
data class ShipmentResponseDTO(
    val orderId: String,
    val customerId: Long,
    val customerName: String,
    val status: String,
    val trackingCode: String?,
    val address: AddressResponseDTO?,
    val items: List<ShipmentItemResponseDTO>
)

data class AddressResponseDTO(
    val address: String?,
    val neighborhood: String?,
    val city: String?,
    val postalCode: String?,
    val country: String?
)

data class ShipmentItemResponseDTO(
    val productId: Int,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double
)
