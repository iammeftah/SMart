package wav.hmed.checkoutorder.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import wav.hmed.checkoutorder.model.transaction.Transaction;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByOrderId(String orderId);

    boolean existsByStripeSessionId(String sessionId);
    Optional<Transaction> findByStripeSessionId(String sessionId);
}