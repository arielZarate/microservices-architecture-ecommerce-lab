package com.arielzarate.products.infraestructure.adapters.mappers;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import com.arielzarate.products.infraestructure.rest.models.FakeStoreProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductsMapper {


    @Mapping(target = "category", source = "category.name")
    @Mapping(target="productId",source="id")
    Product toDomain(ProductEntity entity);

    @Mapping(target = "category", ignore = true) // 👈 se setea manualmente
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    ProductEntity toEntity(Product domain);

    @Mapping(target = "category", ignore = true) // 👈 se setea manualmente
    @Mapping(target = "id", ignore = true) // 👈 DB genera
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true) // 👈 se setea manualmente
    @Mapping(target = "imageUrl", source = "image")
    ProductEntity toEntity(FakeStoreProductResponse response);

}
