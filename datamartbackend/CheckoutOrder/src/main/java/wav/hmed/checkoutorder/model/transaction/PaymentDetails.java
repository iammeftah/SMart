package wav.hmed.checkoutorder.model.transaction;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payment_details")
public class PaymentDetails {
    @Id
    private String id;
    private String transactionId;
    private String orderId;
    private String userId;

    // Stripe-specific details
    private String stripeSessionId;
    private String stripePaymentIntentId;
    private String stripeChargeId;

    // Payment metadata
    private Double amount;
    private String currency;
    private String paymentMethod;
    private Map<String, String> additionalMetadata;

    private Date createdAt;
    private Date updatedAt;
}