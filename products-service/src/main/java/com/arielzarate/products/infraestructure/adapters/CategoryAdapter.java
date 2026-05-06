package com.arielzarate.products.infraestructure.adapters;

import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.domain.ports.out.CategoryProvider;
import com.arielzarate.products.infraestructure.adapters.mappers.CategoryMapper;
import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import com.arielzarate.products.infraestructure.persistence.repository.CategoryRepository;
import com.arielzarate.products.interfaces.errors.exception.ApplicationErrorException;
import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryAdapter implements CategoryProvider {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> findAllCategory() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Category> findCategoriesByNameContaining(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(categoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id).map(categoryMapper::toDomain);
    }

    @Override
    public Category getCategoryByName(String name) {
        CategoryEntity categoryEntity = categoryRepository.findByName(name);
        log.warn("Category entity = {}", categoryEntity);
        return categoryMapper.toDomain(categoryEntity);
    }

    @Override
    public Category createCategory(String name) {
        return categoryMapper.toDomain(categoryRepository.save(categoryMapper.mapToEntity(name)));
    }

    @Override
    public Category updateCategory(Category category) {
        CategoryEntity entity = categoryMapper.mapToEntity(category);
        entity.setId(category.getId());
        return categoryMapper.toDomain(categoryRepository.save(entity));
    }

    @Override
    public Boolean inactiveCategory(String name) {
        return null;
    }
}
