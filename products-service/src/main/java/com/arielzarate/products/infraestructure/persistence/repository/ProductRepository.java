package com.arielzarate.products.infraestructure.persistence.repository;


import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    @Modifying
    @Query("""
            UPDATE ProductEntity p
            SET p.isActive= false
            WHERE p.id = :id
            """)
    public Boolean deletedLogicProduct(Long id);

    @Modifying
    @Query("""
            UPDATE ProductEntity p
            SET p.isActive= true
            WHERE p.id = :id
            """)
    public Boolean activeProduct(Long id);


}
