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

    /**
     * Mapping entity to Domain
     */
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "productId", source = "id")
    @Mapping(target = "active", source = "isActive")
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "imageUrl", source = "imageUrl")
    Product toDomain(ProductEntity entity);

    Rating toDomain(RatingEntity entity);


    /***Mapping Domain to Entity - create - update**/
    // @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "id", source = "productId")
    ProductEntity toEntity(Product domain);

    RatingEntity toEntity(Rating rating);


    /**
     * Mapping FAKE-STORE-API -create
     * category-> ignored
     * id-> ignored
     **/
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "id", ignore = true) //create by db auto-incremental
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "imageUrl", source = "image")
    ProductEntity toEntity(FakeStoreProductResponse response);

    RatingEntity toRatingEntity(FakeStoreRatingDTO rating);


}
