package com.arielzarate.shipment.infrastructure.persistence.repository

import com.arielzarate.shipment.infrastructure.persistence.entity.AddressEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AddressRepository : JpaRepository<AddressEntity, Long> {

    fun findAddressByCustomerId(customerId: Long): AddressEntity?


}