package wav.hmed.checkoutorder.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import wav.hmed.checkoutorder.model.purchase.PurchaseRelationship;

import java.util.Optional;
import java.util.List;
import java.util.Date;

public interface PurchaseRelationshipRepository extends MongoRepository<PurchaseRelationship, String> {
    Optional<PurchaseRelationship> findByTransactionId(String transactionId);
    List<PurchaseRelationship> findByPurchaseDateBetween(Date startDate, Date endDate);
}