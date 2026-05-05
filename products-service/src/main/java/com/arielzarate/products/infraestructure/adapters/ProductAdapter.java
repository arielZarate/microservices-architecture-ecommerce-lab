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
import com.arielzarate.products.interfaces.errors.exception.ApplicationErrorException;
import com.arielzarate.products.interfaces.errors.model.ApplicationError;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
@AllArgsConstructor
public class ProductAdapter implements ProductProvider {

    private final ProductsMapper productsMapper;
    private final ProductRepository productRepository;
    private final FakeStoreClient fakeStoreClient;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;


    private List<Product> getProductsDB() {
        return productRepository.findAll().stream().map(productsMapper::toDomain).collect(Collectors.toList());
    }

    /**
     * This method find or create category
     *
     */
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

            List<ProductEntity> productsEntities = productsFetch.stream()
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

            productRepository.saveAll(productsEntities);
            log.info("saving products FakeStoreApi in database");

            list = productsEntities.stream().map(productsMapper::toDomain).collect(Collectors.toList());
        }
        return list;
    }

    @Override
    public Optional<Product> findProductById(Long productId) {
        return productRepository.findById(productId).map(productsMapper::toDomain);
    }

    @Override
    public Product saveProduct(Product product) {
        log.info("Product: {}", product.toString());
        ProductEntity entity = productsMapper.toEntity(product);

        //before find category by id
        CategoryEntity category = categoryRepository.findById(product.getCategoryId())
                .orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Category not found")));
        entity.setCategory(category);

        return productsMapper.toDomain(productRepository.save(entity));
    }

    @Override
    public Product updateProduct(Product product, Long productId) {
        ProductEntity entity = productsMapper.toEntity(product);
        /**
         * The Category is Class , first find by Id , after matching
         * */
        CategoryEntity category = categoryRepository.findById(product.getCategoryId())
                .orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Category not found")));

        //setting objet
        entity.setCategory(category);

        return productsMapper.toDomain(productRepository.save(entity));
    }


    @Override
    public void deleteLogicProduct(Long productId) {
        ProductEntity entity = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Product with id: " + productId + " not found")));
        entity.softDelete();
        productRepository.save(entity);
    }

    @Override
    public void activeProduct(Long productId) {
        ProductEntity entity = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationErrorException(ApplicationError.notFoundError("Product with id: " + productId + " not found")));
        entity.softActive();
        productRepository.save(entity);
    }
}
