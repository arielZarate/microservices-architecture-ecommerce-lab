package com.arielzarate.shipment.domain.ports.`in`

interface ShipmentStatusService {
    fun processPreparingToShipped()
    fun processShippedToDelivered()
}
