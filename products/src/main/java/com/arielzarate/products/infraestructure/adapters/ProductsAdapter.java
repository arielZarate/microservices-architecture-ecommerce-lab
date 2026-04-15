package com.arielzarate.products.infraestructure.adapters;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.out.ProductsProvider;
import com.arielzarate.products.infraestructure.adapters.mappers.ProductsMapper;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import com.arielzarate.products.infraestructure.persistence.repository.ProductRepository;
import com.arielzarate.products.infraestructure.rest.FakeStoreClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductsAdapter implements ProductsProvider {

    private final ProductsMapper productsMapper;
    private final ProductRepository productRepository;
    private final FakeStoreClient fakeStoreClient;


    private List<Product> getProductsDB() {
        return productRepository.findAll().stream().map(productsMapper::toDomain).collect(Collectors.toList());
    }


    @Override
    public List<Product> getProducts() {
        List<Product> list ;

        list = getProductsDB();


        if (list.isEmpty()) {
            list = fakeStoreClient.getAllProducts().stream().map(productsMapper::toDomain).collect(Collectors.toList());


            //mapping data
            List<ProductEntity> entities = list.stream().map(productsMapper::toEntity).toList();

            productRepository.saveAll(entities);
            log.info("saving products FakeStoreApi in database");

        }
        return list;

    }

    @Override
    public Optional<Product> findProductById(String productId) {
        return productRepository.findById(productId).map(productsMapper::toDomain);
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
