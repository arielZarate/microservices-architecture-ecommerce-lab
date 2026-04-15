package com.arielzarate.products.infraestructure.rest.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FakeStoreProductResponse(
        Integer id,
        String title,
        Double price,
        String description,
        String category,
        String image
) {}