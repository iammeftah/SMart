package wav.hmed.checkoutorder.model.purchase;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentConfirmationResponse {
    private String transactionId;
    private String status;
    private String orderId;
    private Double amount;
    private String message;

    public PaymentConfirmationResponse(String status, String orderId, Double amount, String message) {
        this.status = status;
        this.orderId = orderId;
        this.amount = amount;
        this.message = message;
    }
}