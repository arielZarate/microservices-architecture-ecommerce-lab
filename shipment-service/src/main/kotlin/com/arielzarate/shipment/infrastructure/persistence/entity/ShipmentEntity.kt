package com.arielzarate.shipment.infrastructure.persistence.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "shipment")
class ShipmentEntity(
    @Id
    @Column(columnDefinition = "UUID")
    val id: UUID,

    @Column(nullable = false)
    var customerId: Long,

    @Column(nullable = false)
    var customerName: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ShipmentStatusEntity,

    var trackingCode: String? = null,

    @OneToOne(cascade = [CascadeType.ALL])
    @JoinColumn(name = "address_id")
    var address: AddressEntity? = null,

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "shipment_id")
    var items: MutableList<ShipmentItemEntity> = mutableListOf()
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
