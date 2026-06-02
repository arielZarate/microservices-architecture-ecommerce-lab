package com.arielzarate.shipment.interfaces.error.model

// RFC 7807 standard: type, title, status, detail, instance
data class ClientError(
    val type: String?,
    val title: String,
    val status: Int,
    val detail: String?,
    val instance: String?,
    val errors:List<Error>?
)


data class Error(
    val code: Long?,
    val message: String?,
    val status: Int?
)