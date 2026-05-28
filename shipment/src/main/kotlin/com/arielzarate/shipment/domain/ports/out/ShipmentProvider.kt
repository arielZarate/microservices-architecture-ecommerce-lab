package com.arielzarate.shipment.domain.ports.out

import com.arielzarate.shipment.domain.model.Shipment

interface ShipmentProvider {
    fun findAll(): List<Shipment>
    fun findByOrderId(orderId: Long): Shipment?
}
