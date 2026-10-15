package com.arielzarate.products.infraestructure.persistence.repository;

import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    CategoryEntity findByName(String name);

    Boolean existsByName(String name);

    List<CategoryEntity> findByNameContainingIgnoreCase(String name);
}
