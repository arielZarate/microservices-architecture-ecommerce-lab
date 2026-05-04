package com.arielzarate.products.infraestructure.persistence.models;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "category")
public class CategoryEntity extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

}
