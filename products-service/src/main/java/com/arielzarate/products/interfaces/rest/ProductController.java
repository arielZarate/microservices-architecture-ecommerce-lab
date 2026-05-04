package com.arielzarate.products.interfaces.rest;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.in.ProductService;
import com.arielzarate.products.interfaces.rest.dto.ProductRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import com.arielzarate.products.interfaces.rest.mapper.ProductMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/products")
@Tag(name = "Products", description = "Product management endpoints")
@AllArgsConstructor
public class ProductController {

    private final ProductService service;
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
                .map(productMapper::mapProductDTO)
                .toList();

        log.info("Response GET all products");
        return ResponseEntity.ok().body(list);

    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody ProductRequestDTO request) {
        Product product = service.createProduct(productMapper.mapDomain(request));
        return ResponseEntity.ok(productMapper.mapProductDTO(product));
    }

//    @PutMapping
//    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long idProduct, @NotNull @RequestBody ProductRequestDTO request) {
//        Product product = service.updateProduct(productMapper.mapDomain(request), idProduct);
//        return ResponseEntity.ok(productMapper.mapDTO(product));
//    }

//    @GetMapping
//    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long idProduct) {
//        ProductResponseDTO dto = productMapper.mapDTO(service.getProductById(idProduct));
//        return ResponseEntity.ok(dto);
//    }

//    @DeleteMapping
//    public Boolean deletedLogicProductById(@PathVariable Long idProduct) {
//        return service.deleteLogicProduct(idProduct);
//    }
//
//    @PostMapping
//    public Boolean activeLogicProductById(@PathVariable Long idProduct) {
//        return service.activeLogicProduct(idProduct);
//    }


}
