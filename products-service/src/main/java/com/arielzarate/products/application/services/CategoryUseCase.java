package com.arielzarate.products.application.services;

import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.domain.ports.in.CategoryService;
import org.springframework.stereotype.Service;

@Service
public class CategoryUseCase  implements CategoryService {
    @Override
    public Category categoryByName(String name) {
        return null;
    }

    @Override
    public Category createCategory(String name) {
        return null;
    }

    @Override
    public Category updateCategory(String name, Long id) {
        return null;
    }

    @Override
    public Boolean deleteCategory(String name) {
        return null;
    }
}
