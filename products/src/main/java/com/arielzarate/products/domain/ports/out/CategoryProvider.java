package com.arielzarate.products.domain.ports.out;

import com.arielzarate.products.domain.models.Category;

import java.util.Optional;

public interface CategoryProvider {
    public Category getCategoryByName(String name);
    public Category createCategory(String name);
    public Category updateCategory(String name, Long id );
    public Boolean inactiveCategory(String name);

}
