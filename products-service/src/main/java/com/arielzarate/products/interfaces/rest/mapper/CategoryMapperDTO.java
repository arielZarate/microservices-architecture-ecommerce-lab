package com.arielzarate.products.interfaces.rest.mapper;

import com.arielzarate.products.domain.models.Category;
import com.arielzarate.products.interfaces.rest.dto.CategoryRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.CategoryResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapperDTO {


    default String mapToDomain(CategoryRequestDTO dto) {
        return dto.getName();
    }

    CategoryResponseDTO mapToDTO(Category category);

}
