package wav.hmed.checkoutorder.model.micro;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    private String id;
    private String userId;
    private List<CartItem> items;
    private Double totalAmount;
    private Integer loyaltyPoints;
    private Date lastModified;

    public List<CartItem> getCartItems() {
        return items;
    }
}
