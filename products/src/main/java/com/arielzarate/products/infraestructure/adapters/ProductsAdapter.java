package com.arielzarate.products.infraestructure.adapters;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.out.ProductsProvider;
import com.arielzarate.products.infraestructure.adapters.mappers.ProductsMapper;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import com.arielzarate.products.infraestructure.persistence.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductsAdapter implements ProductsProvider {

    private final ProductsMapper productsMapper;
    private final ProductRepository productRepository;

    @Override
    public List<Product> findAll() {
        return productRepository.findAll()
                .stream()
                .map(productsMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Product> findById(String productId) {
        return productRepository.findById(productId)
                .map(productsMapper::toDomain);
    }

    @Override
    public Product createProduct(Product product) {
        ProductEntity entity = productsMapper.toEntity(product);
        ProductEntity saved = productRepository.save(entity);
        return productsMapper.toDomain(saved);
    }

    @Override
    public Product updateProduct(Product product) {
        ProductEntity entity = productsMapper.toEntity(product);
        ProductEntity saved = productRepository.save(entity);
        return productsMapper.toDomain(saved);
    }

    @Override
    public void deleteProduct(String productId) {
        productRepository.deleteById(productId);
    }
}
