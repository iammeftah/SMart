package wav.hmed.productscrud.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private String productId;
    private String name;
    private Double price;
    private Integer quantity;
    private String image;
    private Integer discount;
    private String brandName;
    // Added for easier cart calculations
    private Double subtotal;
}