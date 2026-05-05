package com.arielzarate.products.domain.ports.in;

import com.arielzarate.products.domain.models.Product;

import java.util.List;

public interface ProductService {

    List<Product> getAllProducts();

    Product getProductById(Long productId);

    Product createProduct(Product product);

    Product updateProduct(Product product, Long productId);
//
//    Boolean deleteLogicProduct(Long productId);
//
//    Boolean activeLogicProduct(Long idProduct);
}
