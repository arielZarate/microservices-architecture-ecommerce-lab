package com.arielzarate.products.domain.ports.in;

import com.arielzarate.products.domain.models.Category;

public interface CategoryService {

    public Category categoryByName(String name);
    public Category createCategory(String name);
    public Category updateCategory(String name,Long id);
    public Boolean deleteCategory(String name);

}
