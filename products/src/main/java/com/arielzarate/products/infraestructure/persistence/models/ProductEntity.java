package com.arielzarate.products.infraestructure.persistence.models;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product")
@Getter
@Setter
public class ProductEntity {

    @Id
    @Column(name = "product_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    //todo: luego se vinculara con una tabla categories
    @Column(name = "category")
    private String category;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "image_url")
    private String imageUrl;

}
