package com.arielzarate.shipment.infrastructure.persistence.adapter

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.ports.out.ShipmentProvider
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentEntity
import com.arielzarate.shipment.infrastructure.persistence.mapper.ShipmentMapper
import com.arielzarate.shipment.infrastructure.persistence.repository.ShipmentRepository
import org.springframework.stereotype.Component

@Component
class ShipmentAdapter(
    private val repository: ShipmentRepository, private val mapper: ShipmentMapper
) : ShipmentProvider {

    override fun findAll(): List<Shipment> {
        return repository.findAll().map { mapper.toDomain(it) }
    }

    override fun findByOrderId(orderId: String): Shipment? {
        return repository.findById(orderId).map (mapper::toDomain).orElse(null)
    }

    override fun save(shipment: Shipment): Shipment {
        val entity = mapper.toEntity(shipment)
        val saved = repository.save(entity)
        return mapper.toDomain(saved)
    }
}
