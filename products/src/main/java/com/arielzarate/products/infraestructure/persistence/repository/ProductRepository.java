package com.arielzarate.products.infraestructure.persistence.repository;


import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {
}
