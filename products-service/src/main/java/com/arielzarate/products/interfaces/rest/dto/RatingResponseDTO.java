package com.arielzarate.products.interfaces.rest.dto;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RatingResponseDTO {
    private Double rate;
    private Integer count;
}
