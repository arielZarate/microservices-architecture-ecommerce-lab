package com.arielzarate.products.infraestructure.rest;

import com.arielzarate.products.infraestructure.rest.models.FakeStoreProductResponse;
import com.arielzarate.products.infraestructure.rest.providers.WebClientMethod;
import com.arielzarate.products.infraestructure.rest.providers.WebClientProvider;
import com.arielzarate.products.interfaces.errors.exception.ExternalClientException;
import com.arielzarate.products.interfaces.errors.model.ClientError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class FakeStoreClient {
    //TODO: ES UNA URL PUBLICA LA DEJARE HARCODEADA
    private static final String BASE_URL = "https://fakestoreapi.com";
    private static final String CLIENT_NAME = "FakeStoreClient";
    private static final long DEFAULT_TIMEOUT = 5000L; //environment

    private final WebClientProvider webClientProvider;

    public FakeStoreClient(WebClientProvider webClientProvider) {
        this.webClientProvider = webClientProvider;
    }

    public List<FakeStoreProductResponse> getAllProducts() {
        log.info("Fetching all products from FakeStore API");
        URI uri = URI.create(BASE_URL + "/products");

        FakeStoreProductResponse[] products = webClientProvider.apply(
                CLIENT_NAME,
                WebClientMethod.GET,
                uri,
                DEFAULT_TIMEOUT,
                null,
                FakeStoreProductResponse[].class
        );
        log.info("Finish fetch all products from FakeStoreApi");
        return products != null ? Arrays.asList(products) : Collections.emptyList();
    }


}
