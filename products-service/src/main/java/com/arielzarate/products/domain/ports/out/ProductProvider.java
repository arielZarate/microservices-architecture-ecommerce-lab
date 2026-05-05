package com.arielzarate.products.domain.ports.out;

import com.arielzarate.products.domain.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductProvider {
    List<Product> fetchOrCreateProducts();

    Optional<Product> findProductById(Long productId);

    Product saveProduct(Product product);

    Product updateProduct(Product product, Long productId);

    Boolean deleteLogicProduct(Long productId);

//    Boolean activeProduct(Long productId);
}
