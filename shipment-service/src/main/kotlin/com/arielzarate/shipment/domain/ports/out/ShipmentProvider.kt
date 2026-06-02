package com.arielzarate.shipment.domain.ports.out

import com.arielzarate.shipment.domain.model.Shipment

interface ShipmentProvider {
    fun findAll(): List<Shipment>
    fun findByOrderId(orderId: String): Shipment?
    fun save(shipment: Shipment): Shipment
}
