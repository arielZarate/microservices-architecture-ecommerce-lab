package com.arielzarate.shipment.infrastructure.rest.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClient.Builder


@Configuration
class WebConfig {

    @Bean
    fun webClient(builder: Builder): WebClient {
        return builder.build()
    }

}