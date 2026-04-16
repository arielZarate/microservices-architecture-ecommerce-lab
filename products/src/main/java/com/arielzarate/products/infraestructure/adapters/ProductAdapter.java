package com.arielzarate.products.infraestructure.adapters;


import com.arielzarate.products.domain.models.Product;
import com.arielzarate.products.domain.ports.out.ProductProvider;
import com.arielzarate.products.infraestructure.adapters.mappers.CategoryMapper;
import com.arielzarate.products.infraestructure.adapters.mappers.ProductsMapper;
import com.arielzarate.products.infraestructure.persistence.models.CategoryEntity;
import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import com.arielzarate.products.infraestructure.persistence.repository.CategoryRepository;
import com.arielzarate.products.infraestructure.persistence.repository.ProductRepository;
import com.arielzarate.products.infraestructure.rest.FakeStoreClient;
import com.arielzarate.products.infraestructure.rest.models.FakeStoreProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductAdapter implements ProductProvider {

    private final ProductsMapper productsMapper;
    private final ProductRepository productRepository;
    private final FakeStoreClient fakeStoreClient;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;


    private List<Product> getProductsDB() {
        return productRepository.findAll().stream().map(productsMapper::toDomain).collect(Collectors.toList());
    }

    private CategoryEntity findOrCreateCategory(String categoryName) {
        CategoryEntity category = categoryRepository.findByName(categoryName);
        if (category != null) {
            return category;
        }
        return categoryRepository.save(categoryMapper.toEntity(categoryName));
    }


    @Override
    public List<Product> fetchOrCreateProducts() {
        List<Product> list = getProductsDB();

        if (list.isEmpty()) {
            List<FakeStoreProductResponse> productsFetch = fakeStoreClient.getAllProducts();

            List<ProductEntity> entities = productsFetch.stream()
                    .map(product -> {
                        //1.Map to entitie
                        ProductEntity entity = productsMapper.toEntity(product);
                        //2 find category if not create new category
                        CategoryEntity category = findOrCreateCategory(product.category());
                        //3.setter entity category with category search
                        entity.setCategory(category);
                        return entity;
                    })
                    .toList();

            productRepository.saveAll(entities);
            log.info("saving products FakeStoreApi in database");

            list = entities.stream().map(productsMapper::toDomain).collect(Collectors.toList());
        }
        return list;
    }

    @Override
    public Optional<Product> findProductById(Long productId) {
        return productRepository.findById(productId).map(productsMapper::toDomain);
    }

    @Override
    public Product saveProduct(Product product) {
        ProductEntity entity = productRepository.save(productsMapper.toEntity(product));
        return productsMapper.toDomain(entity);
    }

    @Override
    public void deleteProduct(Long productId) {
         productRepository.deleteById(productId);
    }
}
