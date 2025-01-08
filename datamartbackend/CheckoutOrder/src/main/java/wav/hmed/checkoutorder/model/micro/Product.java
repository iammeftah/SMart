package wav.hmed.checkoutorder.model.micro;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private static final Logger log = LogManager.getLogger(Product.class);
    private String id; // We'll keep it as String since we don't need MongoDB specific features in this service
    private String name;
    private String description;
    private Double price;
    private Double rating;
    private Integer reviews;
    private String image;
    private List<String> category;
    private Long brandId;
    private String brandName;
    private Boolean isNew;
    private Boolean isFeatured;
    private Date postedDate;
    private Integer purchaseCount;
    private Boolean clearance;
    private Integer discount;
    private Integer stock;

    // Helper method to calculate final price considering discount
    public Double getFinalPrice() {
        if (discount != null && discount > 0) {
            return price - (price * discount / 100.0);
        }
        return price;
    }

    // Helper method to check if product is in stock
    public boolean isInStock() {
        return stock != null && stock > 0;
    }

    // Helper method to check if specific quantity is available
    public boolean hasAvailableQuantity(int quantity) {
        return stock != null && stock >= quantity;
    }

    // Helper method to get formatted discount price
    public String getFormattedDiscountPrice() {
        if (discount != null && discount > 0) {
            return String.format("%.2f", getFinalPrice());
        }
        return null;
    }

    public boolean canReduceStock(int quantity) {
        log.debug("Checking if can reduce stock. Current stock: {}, Requested quantity: {}", stock, quantity);
        boolean result = stock != null && stock >= quantity;
        log.debug("Stock reduction check result: {}", result);
        return result;
    }

    public void reduceStock(int quantity) {
        log.debug("Attempting to reduce stock by {}. Current stock: {}", quantity, stock);
        if (!canReduceStock(quantity)) {
            log.error("Insufficient stock for reduction. Current stock: {}, Requested quantity: {}", stock, quantity);
            throw new IllegalStateException("Insufficient stock");
        }
        this.stock -= quantity;
        this.purchaseCount = (this.purchaseCount != null ? this.purchaseCount : 0) + quantity;
        log.info("Stock reduced successfully. New stock: {}, New purchase count: {}", stock, purchaseCount);
    }
}