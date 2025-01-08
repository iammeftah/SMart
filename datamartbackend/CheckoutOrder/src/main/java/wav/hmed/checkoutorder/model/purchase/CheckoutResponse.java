package wav.hmed.checkoutorder.model.purchase;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutResponse {
    private String stripeSessionId;
    private ObjectId orderId;
}