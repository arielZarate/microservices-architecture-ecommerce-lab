package com.arielzarate.shipment.infrastructure.rest.addressClient.dto

data class AddressResponse(
    val customerId: Long,
    val address: String?,
    val neighborhood: String?,
    val city: String?,
    val postalCode: String?,
    val country: String?
)
