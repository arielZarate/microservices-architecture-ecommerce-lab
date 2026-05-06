package com.arielzarate.products.application.services;

import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.domain.ports.in.CategoryService;
import com.arielzarate.products.domain.ports.out.CategoryProvider;
import com.arielzarate.products.infraestructure.adapters.mappers.CategoryMapper;
import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import com.arielzarate.products.interfaces.errors.exception.ApplicationErrorException;
import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class CategoryUseCase implements CategoryService {
    private final CategoryProvider categoryProvider;
    private final CategoryMapper categoryMapper;


    @Override
    public Category getCategoryById(Long id) {
        return categoryProvider.getCategoryById(id)
                .orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Category not found")));
    }

    @Override
    public List<Category> findAllCategory(String name) {
        if (name != null && !name.isBlank()) {
            return categoryProvider.findCategoriesByNameContaining(name);
        }
        return categoryProvider.findAllCategory();
    }


    @Override
    public Category createCategory(String name) {
        if (categoryProvider.getCategoryByName(name) != null) {
            throw new ApplicationErrorException(ApplicationError.conflict("Category exists"));
        }
        return categoryProvider.createCategory(name);
    }

    @Override
    public Category updateCategory(String name, Long id) {
        Optional<Category> categoryOptional = categoryProvider.getCategoryById(id);
        if (categoryOptional.isEmpty()) {
            throw new ApplicationErrorException(ApplicationError.conflict("Category Not exists"));
        }

        Category category = categoryOptional.get();
        category.setId(id);
        category.setName(name);
        log.info("Category with id = {} updated and saved", id);
        return categoryProvider.updateCategory(category);
    }

    @Override
    public Boolean deleteCategory(String name) {
        return null;
    }
}
