package com.arielzarate.shipment.infrastructure.rest.userClient

data class UserResponse(
    val id: Long,
    val name: String,
    val lastName: String,
    val email: String,
    val address: String?,
    val neighborhood: String?,
    val city: String?,
    val postalCode: String?,
    val country: String?
)
