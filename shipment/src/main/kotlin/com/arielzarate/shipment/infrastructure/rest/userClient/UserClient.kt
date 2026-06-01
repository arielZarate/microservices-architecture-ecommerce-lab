package com.arielzarate.shipment.infrastructure.rest.userClient

interface UserClient {
    fun getUserById(id: Long): UserResponse
}