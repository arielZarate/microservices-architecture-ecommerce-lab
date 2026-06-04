package com.arielzarate.shipment.infrastructure.persistence.repository

import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentEntity
import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentStatusEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ShipmentRepository : JpaRepository<ShipmentEntity, UUID> {
    fun findByStatus(status: ShipmentStatusEntity): List<ShipmentEntity>
}
