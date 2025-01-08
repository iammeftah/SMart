package wav.hmed.productscrud.repository;



import org.springframework.data.mongodb.repository.MongoRepository;
import wav.hmed.productscrud.model.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {
    // You can add custom query methods here if needed
}