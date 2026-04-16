package com.arielzarate.products.domain.ports.in;

import com.arielzarate.products.domain.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    List<Product> getAllProducts();

    Product getProductById(Long productId);

    Product createOrUpdateProduct(Product product, Optional<Long> productId);

    void deleteProduct(Long productId);

}
