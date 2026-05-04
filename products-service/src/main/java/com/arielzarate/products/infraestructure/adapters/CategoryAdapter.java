package com.arielzarate.products.infraestructure.adapters;

import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.domain.ports.out.CategoryProvider;
import com.arielzarate.products.infraestructure.adapters.mappers.CategoryMapper;
import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import com.arielzarate.products.infraestructure.persistence.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoryAdapter implements CategoryProvider {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public Category getCategoryByName(String name) {
        return categoryMapper.toDomain(categoryRepository.findByName(name));
    }

    @Override
    public Category createCategory(String name) {
        CategoryEntity entity = categoryMapper.toEntity(name);
        CategoryEntity saved = categoryRepository.save(entity);
        return categoryMapper.toDomain(saved);
    }

    @Override
    public Category updateCategory(String name, Long id) {
        return null;
    }

    @Override
    public Boolean inactiveCategory(String name) {
        return null;
    }
}
