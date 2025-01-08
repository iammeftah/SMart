package wav.hmed.productscrud.repository;


import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import wav.hmed.productscrud.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    @Query("{ $or: [ " +
            "{ 'name': { $regex: ?0, $options: 'i' } }, " +
            "{ 'brandName': { $regex: ?0, $options: 'i' } }, " +
            "{ 'category': { $regex: ?0, $options: 'i' } } " +
            "] }")
    List<Product> searchProducts(String searchTerm);
    Product findProductById(ObjectId id);
    List<Product> findByIsNewTrue();
    Optional<Product> findByName(String name);


}

