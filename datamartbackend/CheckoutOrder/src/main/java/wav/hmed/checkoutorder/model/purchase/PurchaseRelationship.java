package wav.hmed.checkoutorder.model.purchase;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "purchase_relationships")
public class PurchaseRelationship {
    @Id
    private String transactionId;  // Changed to transactionId since we're tracking by transaction
    private List<String> productNames;  // Simply store all product names in the transaction
    private Date purchaseDate;
}