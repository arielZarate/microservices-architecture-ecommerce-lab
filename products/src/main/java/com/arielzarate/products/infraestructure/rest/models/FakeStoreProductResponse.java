package com.arielzarate.products.infraestructure.rest.models;

public record FakeStoreProductResponse(
        Integer id,
        String title,
        Double price,
        String description,
        String category,
        String image
) {}