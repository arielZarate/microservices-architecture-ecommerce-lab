package com.arielzarate.products.domain.ports.out;

import com.arielzarate.products.domain.models.Product;

import java.util.List;
import java.util.Optional;

public interface ProductsProvider {


    List<Product> getProducts();
    Optional<Product> findProductById(String productId);
    Product createProduct(Product product);
    Product updateProduct(Product product);
    void deleteProduct(String productId);


}
