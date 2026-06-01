package com.arielzarate.shipment.infrastructure.rest.userClient

import com.arielzarate.shipment.infrastructure.rest.provider.WebClientMethod
import com.arielzarate.shipment.infrastructure.rest.provider.WebClientProvider
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI

@Component
class UserClientImpl(
    private val webClientProvider: WebClientProvider,
    @Value("\${externals.user-client.timeout}") private val timeout: Long,
    @Value("\${externals.user-client.host}") private val host: String,
    @Value("\${externals.user-client.path}") private val path: String
) : UserClient {

    override fun getUserById(id: Long): UserResponse {
        val uri = URI("$host$path/$id")

        log { info("Calling user-service GET $uri") }

        return webClientProvider.apply(
            method = WebClientMethod.GET,
            uri = uri,
            timeout = timeout,
            responseTypeReference = UserResponse::class.java
        )
    }

    companion object : CompanionLogger()
}