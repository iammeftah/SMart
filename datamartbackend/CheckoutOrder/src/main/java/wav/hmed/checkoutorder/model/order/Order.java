package wav.hmed.checkoutorder.model.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import wav.hmed.checkoutorder.model.micro.CartItem;
import wav.hmed.checkoutorder.model.transaction.TransactionStatus;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    private ObjectId id;
    private String userId;
    private List<CartItem> items;
    private Double totalAmount;
    private Integer loyaltyPoints;
    private Date createdAt;
    private Date updatedAt;
    private OrderStatus status;

    // New payment-related fields
    private String stripeSessionId;
    private TransactionStatus paymentStatus;
    private String paymentMethod;
    private Date paymentCompletedAt;


}


/*
Order
OrderStatus
OrderItem
CheckoutResponse
PaymentConfirmationResponse
PurchaseRelationship

*/