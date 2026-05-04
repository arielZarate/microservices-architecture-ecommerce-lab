package com.arielzarate.products.interfaces.rest.mapper;

import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.models.Rating;
import com.arielzarate.products.interfaces.rest.dto.ProductRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import com.arielzarate.products.interfaces.rest.dto.RatingRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.RatingResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDTO mapProductDTO(Product product);

    Rating mapToRating(RatingRequestDTO rating);


    Product mapDomain(ProductRequestDTO dto);

    RatingResponseDTO toRatingDTO(Rating rating);
}