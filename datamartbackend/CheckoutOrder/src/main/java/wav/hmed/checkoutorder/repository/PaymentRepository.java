package wav.hmed.checkoutorder.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import wav.hmed.checkoutorder.model.transaction.PaymentDetails;

import java.util.Optional;

public interface PaymentRepository extends MongoRepository<PaymentDetails, String> {
    Optional<PaymentDetails> findByOrderId(String orderId);
    Optional<PaymentDetails> findByStripeSessionId(String stripeSessionId);
    Optional<PaymentDetails> findByStripePaymentIntentId(String stripePaymentIntentId);
}