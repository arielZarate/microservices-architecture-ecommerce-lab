package com.arielzarate.products.interfaces.rest.mapper;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.models.Rating;
import com.arielzarate.products.interfaces.rest.dto.ProductRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import com.arielzarate.products.interfaces.rest.dto.RatingRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.RatingResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapperDTO {

    /**mapping  Domain to Dto ***/

    @Mapping(target = "rating", source = "rating")
    ProductResponseDTO mapToProductDTO(Product product);

    RatingResponseDTO mapToRatingDTO(Rating rating);


    /**mapping  dto to Domain ***/
    Rating mapToRating(RatingRequestDTO rating);

    @Mapping(target = "rating", source = "rating")
    Product mapDomain(ProductRequestDTO dto);


}