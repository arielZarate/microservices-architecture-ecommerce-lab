package com.arielzarate.products.interfaces.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Schema(description = "Category response DTO")
public class CategoryResponseDTO {
    private Long id;

    @Schema(description = "Category name", example = "Electronic")
    private String name;

    @Schema(description = "Category active")
    private Boolean active;
}
