package com.arielzarate.products.application.services;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.in.ProductService;
import com.arielzarate.products.domain.ports.out.ProductProvider;
import com.arielzarate.products.interfaces.errors.exception.ApplicationErrorException;
import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class ProductUseCase implements ProductService {

    private final ProductProvider productsProvider;

    @Override
    public List<Product> getAllProducts() {
        return productsProvider.fetchOrCreateProducts();
    }

    @Override
    public Product getProductById(Long productId) {
        return productsProvider.findProductById(productId)
                .orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Product with id: " + productId + " not found")));
    }

    @Override
    public Product updateProduct(Product product, Long productId) {
        Product existing = getProductById(productId);
        if (!validateProduct(product)) {
            throw new ApplicationErrorException(ApplicationError.badRequest("Invalid product data"));
        }

        existing.setTitle(product.getTitle());
        existing.setPrice(product.getPrice());
        existing.setDescription(product.getDescription());
        existing.setImageUrl(product.getImageUrl());
        existing.setCategoryId(product.getCategoryId());
        existing.setRating(product.getRating());

        return productsProvider.updateProduct(existing, productId);

    }

    @Override
    public Product createProduct(Product product) {
        if (!validateProduct(product)) {
            throw new ApplicationErrorException(ApplicationError.badRequest("Invalid product data"));
        }
        return productsProvider.saveProduct(product);
    }

    // log.info("use case product update : {} ", product.toString());

//    @Override
//    public Boolean deleteLogicProduct(Long id) {
//        Product p = getProductById(id);
//        return productsProvider.deleteLogicProduct(p.getProductId());
//    }
//
//    @Override
//    public Boolean activeLogicProduct(Long id) {
//        Product p = getProductById(id);
//        return productsProvider.activeProduct(p.getProductId());
//    }


    //validate product creating
    private Boolean validateProduct(Product product) {
        return product.getTitle() != null && !product.getTitle().isEmpty()
                && product.getPrice() != null && product.getPrice() > 0
                && product.getCategoryId() != null && (product.getCategoryId() > 0);

        //description and imageUrl optional
    }
}
