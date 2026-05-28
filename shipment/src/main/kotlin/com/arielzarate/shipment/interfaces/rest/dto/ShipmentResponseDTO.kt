package com.arielzarate.shipment.interfaces.rest.dto

import io.swagger.v3.oas.annotations.media.Schema

//@Schema(description = "Shipment response DTO")
data class ShipmentResponseDTO(
    //   @Schema(description = "Order ID (same as shipment ID)", example = "1")
    val orderId: Long,

    //  @Schema(description = "Shipment status", example = "PREPARING")
    val status: String,

    //@Schema(description = "Tracking code", example = "SHP-ABC123")
    val trackingCode: String?
)
