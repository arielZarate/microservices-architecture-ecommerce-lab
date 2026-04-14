package com.arielzarate.products.domain.ports.in;

import com.arielzarate.products.domain.models.Product;

import java.util.List;

public interface ProductsService {
    
    List<Product> getAllProducts();
    Product getProductById(String productId);
    Product createProduct(Product product);
    Product updateProduct(Product product);
    void deleteProduct(String productId);

}
