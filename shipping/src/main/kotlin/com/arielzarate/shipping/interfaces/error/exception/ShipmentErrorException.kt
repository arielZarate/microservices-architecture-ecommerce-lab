package com.arielzarate.shipping.interfaces.error.exception

import com.arielzarate.shipping.interfaces.error.model.ShipmentError

class ShipmentErrorException(val error: ShipmentError) : RuntimeException() {
    override val message: String?
        get() = error.message
}
