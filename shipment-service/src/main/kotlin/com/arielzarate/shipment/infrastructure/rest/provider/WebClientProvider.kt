package com.arielzarate.shipment.infrastructure.rest.provider

import com.arielzarate.shipment.interfaces.error.exception.ExternalClientException
import com.arielzarate.shipment.interfaces.error.exception.ExternalClientException.Companion.timeout
import com.arielzarate.shipment.interfaces.error.model.ClientError
import com.arielzarate.shipment.interfaces.utils.CompanionLogger
import org.slf4j.MDC
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatusCode
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.net.URI
import java.time.Duration
import java.util.concurrent.TimeoutException

@Component
class WebClientProvider(
    private val webClient: WebClient
) {


    fun <T : Any, R : Any> applyWithBody(
        method: WebClientMethod,
        uri: URI,
        timeout: Long,
        body: T,
        headers: Map<String, String>? = null,
        cookies: Map<String, String>? = null,
        responseTypeReference: Class<R>
    ): R {
        val traceId = MDC.get("x-trace-id")

     //   log { info("Calling ${method.name} to ${uri.toURL()} with body ${getBodyPrettyJson(body)}") }

        return webClientMethod(method)
            .uri(uri)
            .headers { header -> headers?.let { value -> header.setAll(value) } }
            .cookies { cookie -> cookies?.let { cookie.setAll(cookies) } }
            .body(Mono.just(body), body::class.java)
            .retrieve()
            .onStatus({ t: HttpStatusCode -> t.isError }) { response ->
                response.bodyToMono(ClientError::class.java)
                    .flatMap { clientError ->
                        val ex = ExternalClientException(clientError)
                        ex.log {
                            error("[$traceId] Call response ERROR ${method.name} ${uri.toURL()}. Response: ${clientError}")
                        }
                        Mono.error(ex)
                    }
            }
            .bodyToMono(responseTypeReference)
            .timeout(Duration.ofMillis(timeout))
            .block()!!.log {
                info("Response OK ${method.name} from ${uri.toURL()}")
            }
    }


    fun <R : Any> apply(
        method: WebClientMethod,
        uri: URI,
        timeout: Long,
        headers: Map<String, String>? = null,
        cookies: Map<String, String>? = null,
        responseTypeReference: Class<R>
    ): R {
        val traceId = MDC.get("x-trace-id")

        log {
            info("Calling ${method.name} to ${uri.toURL()} with headers: ${maskAuthorizationHeaderForLog(headers)}")
        }

        return webClientMethod(method)
            .uri(uri)
            .headers { header -> headers?.let { header.setAll(headers) } ?: header }
            .cookies { cookie -> cookies?.let { cookie.setAll(cookies) } }
            .retrieve()
            .onStatus({ t: HttpStatusCode -> t.isError }) { response ->
                response.bodyToMono(ClientError::class.java)
                    .flatMap { clientError ->
                        val ex = ExternalClientException(clientError)
                        ex.log {
                            error("[$traceId] Call response ERROR ${method.name} ${uri.toURL()}. Response: ${clientError}")
                        }
                        Mono.error(ex)
                    }
            }
            .bodyToMono(responseTypeReference)
            .timeout(Duration.ofMillis(timeout))
            .onErrorResume(TimeoutException::class.java) { ex ->
                val clientError = timeout(uri.toString(), ex.message ?: "")
                val wrappedEx = ExternalClientException(clientError)
                wrappedEx.log {
                    error("[$traceId] Call response TIMEOUT ${method.name} ${uri.toURL()}. Response: ${it.clientError}")
                }
                Mono.error(wrappedEx)
            }
            .block()!!
            .log {
                info("Call response OK ${method.name} to ${uri.toURL()}")
            }
    }


    fun webClientMethod(httpMethod: WebClientMethod) =
        when (httpMethod) {
            WebClientMethod.GET -> webClient.method(HttpMethod.GET)
            WebClientMethod.DELETE -> webClient.method(HttpMethod.DELETE)
            WebClientMethod.POST -> webClient.method(HttpMethod.POST)
            WebClientMethod.PUT -> webClient.method(HttpMethod.PUT)
            WebClientMethod.PATCH -> webClient.method(HttpMethod.PATCH)
        }

    companion object : CompanionLogger()

fun maskAuthorizationHeaderForLog(headers: Map<String, String>?): Map<String, String>? {
    return headers?.mapValues { (key, value) ->
        when {
            key.equals("Authorization", ignoreCase = true) && value.startsWith("Bearer ") -> {
                val token = value.removePrefix("Bearer ").trim()
                val masked = if (token.length > 20) {
                    val visibleStart = 10
                    val visibleEnd = 10
                    val maskedPart = "*".repeat(token.length - visibleStart - visibleEnd)
                    "Bearer ${token.take(visibleStart)}$maskedPart${token.takeLast(visibleEnd)}"
                } else {
                    "Bearer ${"*".repeat(token.length)}"
                }
                masked
            }
            key.equals("X-Api-Key", ignoreCase = true) -> {
                if (value.length > 8) {
                    "${value.take(4)}****${value.takeLast(4)}"
                } else {
                    "****"
                }
            }
            else -> value
        }
    }
}
}