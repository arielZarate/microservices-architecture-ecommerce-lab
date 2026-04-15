package com.arielzarate.products.interfaces.rest;


import com.arielzarate.products.domain.ports.in.ProductsService;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import com.arielzarate.products.interfaces.rest.mapper.ProductMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Product management endpoints")
@AllArgsConstructor
public class ProductController {

    private final ProductsService service;
    private final ProductMapper productMapper;

    @Operation(
            summary = "Get all products",
            description = "Returns a list of all products. If database is empty, fetches from FakeStore API."
    )
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts() {

        log.info("Request GET all products");
        List<ProductResponseDTO> list = service.getAllProducts()
                .stream()
                .map(productMapper::toDTO)
                .toList();

        log.info("Response GET all products");
        return ResponseEntity.ok().body(list);


    }
}
