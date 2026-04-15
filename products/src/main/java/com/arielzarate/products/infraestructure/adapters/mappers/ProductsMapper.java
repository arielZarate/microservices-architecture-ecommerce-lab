package com.arielzarate.products.infraestructure.adapters.mappers;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import com.arielzarate.products.infraestructure.rest.models.FakeStoreProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductsMapper {


    Product toDomain(ProductEntity entity);

    ProductEntity toEntity(Product domain);

    @Mapping(target = "productId", ignore = true) // 👈 DB genera
    @Mapping(target = "imageUrl", source = "image")
    @Mapping(target = "active", constant = "true")
    Product toDomain(FakeStoreProductResponse response);
}
