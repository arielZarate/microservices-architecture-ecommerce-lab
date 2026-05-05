package com.arielzarate.products.infraestructure.persistence.repository;


import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    //JPQL methods
    List<ProductEntity> findByCategoryId(Long categoryId);

    List<ProductEntity> findByTitleContainingIgnoreCase(String title);

    List<ProductEntity> findByCategoryIdAndTitleContainingIgnoreCase(Long categoryId, String title);

}
