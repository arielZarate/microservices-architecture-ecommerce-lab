package com.arielzarate.products.application.services;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.in.ProductService;
import com.arielzarate.products.domain.ports.out.ProductProvider;
import com.arielzarate.products.interfaces.errors.exception.ApplicationErrorException;
import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductUseCase implements ProductService {

    private final ProductProvider productsProvider;

    @Override
    public List<Product> getAllProducts() {
        return productsProvider.fetchOrCreateProducts();
    }

    @Override
    public Product getProductById(Long productId) {
        return productsProvider.findProductById(productId).orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Product with id: " + productId + " not found")));
    }

    @Override
    public Product createOrUpdateProduct(Product product, Optional<Long> productId) {
        if (productId.isPresent()) {
            Product existing = getProductById(productId.get());
            //falta validar campos
            existing.setTitle(product.getTitle());
            existing.setPrice(product.getPrice());
            existing.setDescription(product.getDescription());
            existing.setImageUrl(product.getImageUrl());
            existing.setCategory(product.getCategory());

            return productsProvider.saveProduct(existing);
        }
        return productsProvider.saveProduct(product);
    }

    @Override
    public void deleteProduct(Long id) {
        productsProvider.deleteProduct(id);
    }
}
