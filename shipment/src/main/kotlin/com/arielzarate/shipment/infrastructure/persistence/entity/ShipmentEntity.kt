package com.arielzarate.shipment.infrastructure.persistence.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "shipment")
class ShipmentEntity(
    @Id
    val id: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ShipmentStatusEntity,

    var trackingCode: String? = null
) {
    @Column(updatable = false)
    var createdAt: LocalDateTime? = null


    var updatedAt: LocalDateTime? = null


    var deletedAt: LocalDateTime? = null

    @PrePersist
    fun prePersist() {
        createdAt = LocalDateTime.now()
        updatedAt = LocalDateTime.now()
    }

    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
