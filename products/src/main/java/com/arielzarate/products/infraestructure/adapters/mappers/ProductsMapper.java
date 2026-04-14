package com.arielzarate.products.infraestructure.adapters.mappers;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductsMapper {

    Product toDomain(ProductEntity entity);
    ProductEntity toEntity(Product domain);
}
