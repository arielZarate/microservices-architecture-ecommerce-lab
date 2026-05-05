package com.arielzarate.products.interfaces.rest;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.in.ProductService;
import com.arielzarate.products.interfaces.rest.dto.ProductRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import com.arielzarate.products.interfaces.rest.mapper.ProductMapperDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Product management endpoints")
@AllArgsConstructor
public class ProductController {

    private final ProductService service;
    private final ProductMapperDTO productMapper;


    //===============FILTER BY CATEGORY OR/AND JACKET=======================
    @Operation(summary = "Get all products", description = "Returns a list of all products. Optional filters: categoryId, search (by title). If database is empty, fetches from FakeStore API.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts(
            @Parameter(description = "Filter by category ID", example = "1") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Search by product title", example = "jacket") @RequestParam(required = false) String search
    ) {

        log.info("Request GET all products");
        List<ProductResponseDTO> list = service.getAllProducts(categoryId,search)
                .stream()
                .map(productMapper::mapToProductDTO)
                .toList();

        log.info("Response GET all products");
        return ResponseEntity.ok().body(list);

    }

    //======================================

    @Operation(summary = "Create a new product", description = "Creates a new product in the database")
    @ApiResponses(value = {@ApiResponse(responseCode = "201", description = "Product created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))), @ApiResponse(responseCode = "400", description = "Invalid request body"), @ApiResponse(responseCode = "500", description = "Internal server error")})
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Parameter(description = "Product data to create", required = true, schema = @Schema(implementation = ProductRequestDTO.class)) @RequestBody ProductRequestDTO request) {
        log.info("Request POST create Product");
        Product product = service.createProduct(productMapper.mapDomain(request));
        log.info("Response POST create Product");
        return ResponseEntity.status(201).body(productMapper.mapToProductDTO(product));
    }

    //======================================

    @Operation(summary = "Update an existing product", description = "Updates a product by its ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Product updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))), @ApiResponse(responseCode = "400", description = "Invalid request body"), @ApiResponse(responseCode = "404", description = "Product not found"), @ApiResponse(responseCode = "500", description = "Internal server error")})
    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@Parameter(description = "Product ID to update", required = true) @PathVariable Long productId, @Parameter(description = "Product data to update", required = true, schema = @Schema(implementation = ProductRequestDTO.class)) @RequestBody ProductRequestDTO request) {
        log.info("Request PUT update Product");
        Product product = service.updateProduct(productMapper.mapDomain(request), productId);
        log.info("Response PUT update Product");
        return ResponseEntity.ok(productMapper.mapToProductDTO(product));
    }

    //==================================

    @Operation(summary = "Found product by id", description = "Search product in database by ID")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Product found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))), @ApiResponse(responseCode = "404", description = "Product not found"), @ApiResponse(responseCode = "500", description = "Internal server error")})
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long productId) {
        log.info("Request GET Product by Id= {}", productId);
        ProductResponseDTO dto = productMapper.mapToProductDTO(service.getProductById(productId));
        log.info("Response GET Product");
        return ResponseEntity.ok(dto);

    }

    //======================================


    @Operation(summary = "Delete a product (soft delete)", description = "Deactivates a product by setting isActive to false")
    @ApiResponses(value = {@ApiResponse(responseCode = "204", description = "Product deactivated successfully"), @ApiResponse(responseCode = "404", description = "Product not found"), @ApiResponse(responseCode = "500", description = "Internal server error")})
    @DeleteMapping("/{productId}")
    public ResponseEntity<HttpStatus> deleteProduct(@PathVariable Long productId) {
        log.info("Request DELETE SOFT Product by Id= {}", productId);
        service.deleteLogicProduct(productId);
        log.info("Response DELETE SOFT Product");
        return ResponseEntity.noContent().build();
    }

    //======================================

    @Operation(summary = "Activate a product (soft activate)", description = "Activates a product by setting isActive to true")
    @ApiResponses(value = {@ApiResponse(responseCode = "204", description = "Product activated successfully"), @ApiResponse(responseCode = "404", description = "Product not found"), @ApiResponse(responseCode = "500", description = "Internal server error")})
    @PostMapping("/{productId}/activate")
    public ResponseEntity<HttpStatus> activateProduct(@PathVariable Long productId) {
        log.info("Request ACTIVATE Product by Id= {}", productId);
        service.activeLogicProduct(productId);
        log.info("Response ACTIVATE Product");
        return ResponseEntity.noContent().build();
    }


}
