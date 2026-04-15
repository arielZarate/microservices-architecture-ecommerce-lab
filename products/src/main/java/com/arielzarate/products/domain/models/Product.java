package com.arielzarate.products.domain.models;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Product {

    private Long productId;
    private String title;
    private Double price;
    private String description;
    private String category;
    private Boolean active;
    private String imageUrl;


}

