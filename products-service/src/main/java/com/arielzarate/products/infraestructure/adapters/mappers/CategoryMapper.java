package com.arielzarate.products.infraestructure.adapters.mappers;

import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category toDomain(CategoryEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    CategoryEntity toEntity(Category domain);

    default CategoryEntity toEntity(String name) {
        CategoryEntity entity = new CategoryEntity();
        entity.setName(name);
        return entity;
    }
}
