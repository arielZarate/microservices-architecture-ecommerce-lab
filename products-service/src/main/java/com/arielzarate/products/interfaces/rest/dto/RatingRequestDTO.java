package com.arielzarate.products.interfaces.rest.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Rating request DTO")
public class RatingRequestDTO {
    @Schema(description = "Rating value", example = "4.5")
    private Double rate;
    @Schema(description = "Rating count", example = "400")
    private Integer count;
}
