package com.arielzarate.products.application.services;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.in.ProductsService;
import com.arielzarate.products.domain.ports.out.ProductsProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductsUseCase implements ProductsService {

    private final ProductsProvider productsProvider;

    @Override
    public List<Product> getAllProducts() {
        return productsProvider.getProducts();
    }

    @Override
    public Product getProductById(String productId) {
        return productsProvider.findProductById(productId).orElse(null);
    }

    @Override
    public Product createProduct(Product product) {
        return productsProvider.createProduct(product);
    }

    @Override
    public Product updateProduct(Product product) {
        return productsProvider.updateProduct(product);
    }

    @Override
    public void deleteProduct(String productId) {
        productsProvider.deleteProduct(productId);
    }
}
