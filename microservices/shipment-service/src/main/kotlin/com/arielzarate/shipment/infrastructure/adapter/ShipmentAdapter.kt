package com.arielzarate.shipment.infrastructure.adapter

import com.arielzarate.shipment.domain.model.Shipment
import com.arielzarate.shipment.domain.model.ShipmentStatus
import com.arielzarate.shipment.domain.ports.out.ShipmentProvider
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentStatusEntity
import com.arielzarate.shipment.infrastructure.persistence.mapper.ShipmentMapper
import com.arielzarate.shipment.infrastructure.persistence.repository.ShipmentRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class ShipmentAdapter(
    private val repository: ShipmentRepository, private val mapper: ShipmentMapper
) : ShipmentProvider {

    @Transactional(readOnly = true)
    override fun findAll(): List<Shipment> {
        return repository.findAll().map { mapper.toDomain(it) }
    }

    @Transactional(readOnly = true)
    override fun findByOrderId(orderId: String): Shipment? {
        return repository.findById(UUID.fromString(orderId)).map (mapper::toDomain).orElse(null)
    }

    @Transactional(readOnly = true)
    override fun findByStatus(status: ShipmentStatus): List<Shipment> {
        val entityStatus = ShipmentStatusEntity.valueOf(status.name)
        return repository.findByStatus(entityStatus).map { mapper.toDomain(it) }
    }

    @Transactional
    override fun save(shipment: Shipment): Shipment {
        val entity = mapper.toEntity(shipment)
        val saved = repository.save(entity)
        return mapper.toDomain(saved)
    }
}