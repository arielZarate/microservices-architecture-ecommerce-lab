package com.arielzarate.products.interfaces.rest.mapper;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDTO toDTO(Product product);
}