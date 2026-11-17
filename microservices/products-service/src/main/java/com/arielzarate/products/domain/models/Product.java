package com.arielzarate.products.domain.models;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@ToString
public class Product {

    private Long productId;//generate by db
    private String title;
    private Double price;
    private String description;
    private Long categoryId;
    private Boolean active;
    private String imageUrl;
    private Rating rating;

}


