package com.arielzarate.products.infraestructure.persistence.repository;


import com.arielzarate.products.infraestructure.persistence.models.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    //    @Modifying
//    @Query("""
//            UPDATE ProductEntity p
//            SET p.isActive= false
//            WHERE p.id = :id
//            """)
//    public Boolean deletedLogicProduct(Long id);
//
//    @Modifying
//    @Query("""
//            UPDATE ProductEntity p
//            SET p.isActive= true
//            WHERE p.id = :id
//            """)
//    public Boolean activeProduct(Long id);
//
//    @Modifying
//    @Query("""
//             UPDATE ProductEntity p
//            SET p.title= :body.title,
//                p.price= :body.price,
//                p.description= :body.description,
//                p.category_id= :body.category,
//                p.image_url= :body.imageUrl,
//                p.rating.rate= :body.rating.rate,
//                p.rating.count= :body.rating.count
//
//                WHERE p.id= :productId
//            """)
    //   public ProductEntity updateProduct(@RequestBody ProductEntity body, @PathVariable Long productId);

}
