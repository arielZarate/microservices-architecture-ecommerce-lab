package com.arielzarate.products.domain.ports.in;

import com.arielzarate.products.domain.models.Category;

import java.util.List;

public interface CategoryService {

    public List<Category> findAllCategory(String name);

    public Category getCategoryById(Long id);

    public Category createCategory(String name);

    public Category updateCategory(String name, Long id);

    void desactiveLogicCategory(Long id);

    void activeLogicCategory(Long id);

}
