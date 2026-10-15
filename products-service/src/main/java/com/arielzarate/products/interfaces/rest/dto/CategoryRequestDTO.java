package com.arielzarate.products.interfaces.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Category request DTO")
public class CategoryRequestDTO {
    private String name;
}
