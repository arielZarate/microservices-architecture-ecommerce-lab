package com.arielzarate.products.domain.ports.out;

import com.arielzarate.products.domain.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductProvider {
    List<Product> fetchOrCreateProducts();

    List<Product> getProducts(Long categoryId, String search);

    Optional<Product> findProductById(Long productId);

    Product saveProduct(Product product);

    Product updateProduct(Product product, Long productId);

    void deleteLogicProduct(Long productId);

    void  activeProduct(Long productId);
}
