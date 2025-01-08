package wav.hmed.checkoutorder.model.transaction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    private String orderId;
    private String userId;
    private Double amount;
    private TransactionStatus status;
    private TransactionType type;
    private Date createdAt;

    // Stripe-specific fields
    private String stripeSessionId;
    private String stripePaymentIntentId;
    private String stripeChargeId;

    // Additional metadata
    private String currency;
    private String paymentMethod;
}