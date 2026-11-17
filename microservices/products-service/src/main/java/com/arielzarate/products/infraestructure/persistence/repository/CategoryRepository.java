package com.arielzarate.products.infraestructure.persistence.repository;

import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository 
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    CategoryEntity findByName(String name);

    Boolean existsByName(String name);

    List<CategoryEntity> findByNameContainingIgnoreCase(String name);
}
