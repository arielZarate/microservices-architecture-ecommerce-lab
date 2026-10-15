package com.arielzarate.products.infraestructure.rest.providers;

import com.arielzarate.products.interfaces.errors.exception.ExternalClientException;
import com.arielzarate.products.interfaces.errors.model.ClientError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Component
@Slf4j
public class WebClientProvider {

    private final WebClient webClient;

    public WebClientProvider(WebClient webClient) {
        this.webClient = webClient;
    }


    /**
     * Ejecuta un request HTTP con body (POST, PUT, PATCH)
     *
     * @param clientName            Nombre del cliente (para logs)
     * @param method                Método HTTP
     * @param uri                   URI completa
     * @param timeout               Timeout en milisegundos
     * @param body                  Body de la request
     * @param headers               Headers (puede ser null)
     * @param responseTypeReference Clase del response
     * @return Response convertido al tipo especificado
     * //
     */

    public <T, R> R applyWithBody(String clientName, WebClientMethod method, URI uri, long timeout, T body, Map<String, String> headers, Class<R> responseTypeReference) {
        log.info("Calling to {} {} {}", clientName, method.name(), uri.toString());


        return webClient.method(HttpMethod.valueOf(method.name())).uri(uri).headers(header -> {
            if (headers != null) {
                header.setAll(headers);
            }
        }).bodyValue(body).retrieve().onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).defaultIfEmpty("Error Client").map(errorBody -> new ExternalClientException(new ClientError("", "Error calling external client " + clientName, response.statusCode().value(), errorBody, uri.toString())))

        ).bodyToMono(responseTypeReference).timeout(Duration.ofMillis(timeout)).onErrorMap(TimeoutException.class, ex -> new ExternalClientException(new ClientError("timeout", "Request timeout", 504, ex.getMessage(), uri.toString()))).onErrorMap(Exception.class, ex -> new ExternalClientException(new ClientError("internal_error", "Unexpected error calling " + clientName, 500, ex.getMessage(), uri.toString()))).block();


    }


    /**
     * Ejecuta un request HTTP sin body (GET, DELETE)
     *
     * @param clientName            Nombre del cliente (para logs)
     * @param method                Método HTTP
     * @param uri                   URI completa
     * @param timeout               Timeout en milisegundos
     * @param headers               Headers (puede ser null)
     * @param responseTypeReference Clase del response
     * @return Response convertido al tipo especificado
     */
    public <R> R apply(String clientName, WebClientMethod method, URI uri, long timeout, Map<String, String> headers, Class<R> responseTypeReference) {
        log.info("Calling to {} GET {}", clientName, uri.toString());

        return webClient.method(HttpMethod.valueOf(method.name())).uri(uri).headers(header -> {
                    if (headers != null) {
                        header.setAll(headers);
                    }
                })
                //not body
                .retrieve()

                //ERRORS HTTP
                .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class).defaultIfEmpty("Error Client").map(errorBody -> new ExternalClientException(new ClientError("", "Error calling external client " + clientName, response.statusCode().value(), errorBody, uri.toString())))).bodyToMono(responseTypeReference).timeout(Duration.ofMillis(timeout))
                //ERROS EJECUTION : TIMEOOUT
                .onErrorMap(TimeoutException.class, ex -> new ExternalClientException(new ClientError("timeout", "Request timeout", 504, ex.getMessage(), uri.toString())))
                //IF NO EXISTS RESPONSE OD TIMEOUT ,DN , SSL -> GENERIC ERROR
                .onErrorMap(Exception.class, ex -> new ExternalClientException(new ClientError("internal_error", "Unexpected error calling " + clientName, 500, ex.getMessage(), uri.toString()))).block();
    }

}
