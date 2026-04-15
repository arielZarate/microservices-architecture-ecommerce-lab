package com.arielzarate.products.interfaces.rest.dto;

public record ProductResponseDTO(
        Long productId,
        String title,
        Double price,
        String description,
        String category,
        Boolean active,
        String imageUrl
) {}