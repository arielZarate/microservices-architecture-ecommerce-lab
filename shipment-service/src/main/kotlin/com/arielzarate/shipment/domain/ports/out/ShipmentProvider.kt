package com.arielzarate.shipment.domain.ports.out

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentStatus

interface ShipmentProvider {
    fun findAll(): List<Shipment>
    fun findByOrderId(orderId: String): Shipment?
    fun findByStatus(status: ShipmentStatus): List<Shipment>
    fun save(shipment: Shipment): Shipment
}
