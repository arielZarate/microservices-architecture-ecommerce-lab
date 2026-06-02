package com.arielzarate.shipment.interfaces.error.exception

import com.arielzarate.shipment.interfaces.error.model.ShipmentError

class ShipmentErrorException(val error: ShipmentError) : RuntimeException() {
    override val message: String?
        get() = error.message
}
