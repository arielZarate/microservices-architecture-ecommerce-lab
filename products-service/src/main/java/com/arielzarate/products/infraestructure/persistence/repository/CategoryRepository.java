package com.arielzarate.products.infraestructure.persistence.repository;

import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    CategoryEntity findByName(String name);

}
