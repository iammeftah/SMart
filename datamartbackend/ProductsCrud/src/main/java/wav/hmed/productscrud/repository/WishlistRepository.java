package wav.hmed.productscrud.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import wav.hmed.productscrud.model.Wishlist;

@Repository
public interface WishlistRepository extends MongoRepository<Wishlist, String> {
    Wishlist findByUserId(String userId);
}
