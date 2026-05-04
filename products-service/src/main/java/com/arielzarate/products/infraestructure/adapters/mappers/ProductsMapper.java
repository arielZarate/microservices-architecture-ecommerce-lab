package com.arielzarate.products.infraestructure.adapters.mappers;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.models.Rating;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import com.arielzarate.products.infraestructure.persistence.models.RatingEntity;
import com.arielzarate.products.infraestructure.rest.models.FakeStoreProductResponse;
import com.arielzarate.products.infraestructure.rest.models.FakeStoreRatingDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductsMapper {

    @Mapping(target = "category", source = "category.name")
    @Mapping(target = "productId", source = "id")
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "rating", source = "rating")
    Product toDomain(ProductEntity entity);

    //MAPPING
    Rating toDomain(RatingEntity entity);

    RatingEntity toEntity(Rating rating);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    ProductEntity toEntity(Product domain);


    /**
     * FAKE-STORE-API
     **/
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "imageUrl", source = "image")
    ProductEntity toEntity(FakeStoreProductResponse response);

    RatingEntity toRatingEntity(FakeStoreRatingDTO rating);


}
