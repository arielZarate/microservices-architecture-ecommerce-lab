package com.arielzarate.shipment.domain.model

data class Address(
    val id: Long = 0,
    val address: String?,
    val neighborhood: String?,
    val city: String?,
    val postalCode: String?,
    val country: String?
)
