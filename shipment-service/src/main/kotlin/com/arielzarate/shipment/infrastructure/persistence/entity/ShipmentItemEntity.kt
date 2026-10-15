package com.arielzarate.shipment.infrastructure.persistence.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "shipment_item")
class ShipmentItemEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var productId: Int,

    @Column(nullable = false)
    var productName: String,

    @Column(nullable = false)
    var quantity: Int,

    @Column(nullable = false)
    var unitPrice: Double
) {
    @Column(updatable = false)
    var createdAt: LocalDateTime? = null

    @PrePersist
    fun prePersist() {
        createdAt = LocalDateTime.now()
    }
}
