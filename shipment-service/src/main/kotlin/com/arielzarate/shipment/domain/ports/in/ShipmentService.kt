package com.arielzarate.shipment.domain.ports.`in`

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentItem

interface ShipmentService {
    fun getAllShipments(): List<Shipment>
    fun getShipmentByOrderId(orderId: String): Shipment
    fun createShipment(orderId: String, customerId: Long, customerName: String, items: List<ShipmentItem>): Shipment
}
