package com.arielzarate.products.interfaces.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Product request DTO")
public class ProductRequestDTO {
    @Schema(description = "Product title", example = "Mens Cotton Jacket")
    private String title;
    @Schema(description = "Product price", example = "99.99")
    private Double price;
    @Schema(description = "Product description", example = "Your perfect pack for everyday use...")
    private String description;
    @Schema(description = "Category ID", example = "1")
    private Long categoryId;
    @Schema(description = "Product image URL", example = "https://fakestoreapi.com/img/81ikpy1kL._AC_UL1500_.jpg")
    private String imageUrl;
    @Schema(description = "Product rating")
    private RatingRequestDTO rating;
}
