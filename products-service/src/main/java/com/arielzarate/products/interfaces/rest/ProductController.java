package com.arielzarate.products.interfaces.rest;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.in.ProductService;
import com.arielzarate.products.interfaces.rest.dto.ProductRequestDTO;
import com.arielzarate.products.interfaces.rest.dto.ProductResponseDTO;
import com.arielzarate.products.interfaces.rest.mapper.ProductMapperDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final ProductMapperDTO productMapper;

    @Operation(
            summary = "Get all products",
            description = "Returns a list of all products. If database is empty, fetches from FakeStore API."
    )
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts() {

        log.info("Request GET all products");
        List<ProductResponseDTO> list = service.getAllProducts()
                .stream()
                .map(productMapper::mapToProductDTO)
                .toList();

        log.info("Response GET all products");
        return ResponseEntity.ok().body(list);

    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody ProductRequestDTO request) {
        log.info("Request POST create Product");
        Product product = service.createProduct(productMapper.mapDomain(request));
        log.info("Response POST create Product");
        return ResponseEntity.ok(productMapper.mapToProductDTO(product));
    }

//    @PutMapping("/{idProduct}")
//    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long idProduct, @RequestBody ProductRequestDTO request) {
//        log.info("Request PUT update Product");
//        Product product = service.updateProduct(productMapper.mapDomain(request), idProduct);
//        log.info("Response PUT update Product");
//        return ResponseEntity.ok(productMapper.mapProductDTO(product));
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
