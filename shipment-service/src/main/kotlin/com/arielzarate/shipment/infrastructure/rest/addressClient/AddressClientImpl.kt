package com.arielzarate.shipment.infrastructure.rest.addressClient

import com.arielzarate.shipment.infrastructure.rest.addressClient.dto.AddressResponse
import com.arielzarate.shipment.infrastructure.rest.provider.WebClientMethod
import com.arielzarate.shipment.infrastructure.rest.provider.WebClientProvider
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.antlr.v4.runtime.misc.MultiMap
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URI

@Component
class AddressClientImpl(
    private val webClientProvider: WebClientProvider,
    @Value("\${externals.address-client.timeout}") private val timeout: Long,
    @Value("\${externals.address-client.host}") private val host: String,
    @Value("\${externals.address-client.path}") private val path: String,
    @Value("\${external.api-key}") private val apiKey: String

) : AddressClient {


    override fun getAddressByCustomerId(customerId: Long): AddressResponse {
        val uri = URI("$host$path/$customerId")

        log { info("Calling user-service address GET $uri") }

        return webClientProvider.apply(
            method = WebClientMethod.GET,
            uri = uri,
            timeout = timeout,
            headers = getHeaders(),
            responseTypeReference = AddressResponse::class.java
        )
    }

    companion object : CompanionLogger()


    fun getHeaders(): Map<String, String> {
        val api = "X-api-Key" to apiKey
        val application = "X-Application" to "shipment-service"

        return mapOf(
            application, api
        )
    }

}
