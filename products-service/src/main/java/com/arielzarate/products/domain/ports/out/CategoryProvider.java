package com.arielzarate.products.domain.ports.out;

import com.arielzarate.products.domain.models.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryProvider {
    List<Category> findAllCategory();

    List<Category> findCategoriesByNameContaining(String name);

    Optional<Category> getCategoryById(Long id);

    Category getCategoryByName(String name);

    Category createCategory(String name);

    Category updateCategory(Category category);

    void inactiveCategory(Long id);

    void activeCategory(Long id);

}
