package com.arielzarate.shipment.infrastructure.persistence.repository

import com.arielzarate.shipment.infrastructure.persistence.entity.ShipmentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ShipmentRepository : JpaRepository<ShipmentEntity, UUID>
