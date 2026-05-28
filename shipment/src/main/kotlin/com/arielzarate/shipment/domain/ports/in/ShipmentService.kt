package com.arielzarate.shipment.domain.ports.`in`

import com.arielzarate.shipment.domain.model.Shipment

interface ShipmentService {
    fun getAllShipments(): List<Shipment>
    fun getShipmentByOrderId(orderId: Long): Shipment
}
