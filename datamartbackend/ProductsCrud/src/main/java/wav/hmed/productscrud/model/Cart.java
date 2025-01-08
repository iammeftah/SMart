package wav.hmed.productscrud.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Date;

@Document(collection = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    private ObjectId id;

    // Getter with type conversion
    public String getId() {
        return id != null ? id.toString() : null;
    }

    private String userId;
    private List<CartItem> items;
    private Double totalAmount;
    private Integer loyaltyPoints;
    private Date lastModified;
}