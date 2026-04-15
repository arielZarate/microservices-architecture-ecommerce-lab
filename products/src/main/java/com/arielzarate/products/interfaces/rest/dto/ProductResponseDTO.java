package com.arielzarate.products.interfaces.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Product response DTO")
public record ProductResponseDTO(
        @Schema(description = "Product unique identifier", example = "1")
        Long productId,

        @Schema(description = "Product title", example = "Mens Cotton Jacket")
        String title,

        @Schema(description = "Product price", example = "99.99")
        Double price,

        @Schema(description = "Product description", example = "Your perfect pack for everyday use...")
        String description,

        @Schema(description = "Product category", example = "men's clothing")
        String category,

        @Schema(description = "Product active status", example = "true")
        Boolean active,

        @Schema(description = "Product image URL", example = "https://fakestoreapi.com/img/81ikpy1kL._AC_UL1500_.jpg")
        String imageUrl
) {}