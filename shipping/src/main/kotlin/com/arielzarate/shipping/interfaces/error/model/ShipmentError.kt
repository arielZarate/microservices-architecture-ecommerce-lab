package com.arielzarate.shipping.interfaces.error.model

class ShipmentError(
    val status: Int,
    val message: String,
    val origin: Throwable? = null
) {
    override fun toString(): String =
        "ShipmentError{status=$status, message='$message', origin=$origin}"

    companion object {
        fun badRequest(detail: String) = ShipmentError(400, "bad request $detail")
        fun conflict(detailConflict: String) = ShipmentError(409, detailConflict)
        fun serverError(origin: Throwable) = ShipmentError(500, "internal server error", origin)
        fun notNullError(field: String) = ShipmentError(400, "$field cannot be null")
        fun notFoundError(message: String) = ShipmentError(404, message)
    }
}
