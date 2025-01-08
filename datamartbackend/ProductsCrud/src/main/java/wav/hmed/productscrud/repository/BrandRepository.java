package wav.hmed.productscrud.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import wav.hmed.productscrud.model.Brand;

public interface BrandRepository extends MongoRepository<Brand, String> {
    // You can add custom query methods here if needed
}