package wav.hmed.productscrud.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private static final org.apache.logging.log4j.Logger log = LogManager.getLogger(Product.class);
    @Id
    private ObjectId id;
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
    @Field("postedDate")
    private Instant postedDate;
    private Integer purchaseCount = 0; // Initialize to 0 by default
    private Boolean clearance;
    private Integer discount;
    private Integer stock;

    public String getId() {
        return id != null ? id.toString() : null;
    }

    // Modified setter to handle String IDs
    public void setId(String id) {
        if (id != null && !id.isEmpty()) {
            try {
                this.id = new ObjectId(id);
            } catch (IllegalArgumentException e) {
                // Log error but don't set invalid ID
                log.error("Invalid ObjectId format: {}", id);
            }
        }
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

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

        // Safely increment purchaseCount
        this.purchaseCount = (this.purchaseCount != null ? this.purchaseCount : 0) + quantity;

        // Increment reviews, defaulting to 0 if null
        this.reviews = (this.reviews != null ? this.reviews : 0) + 1;

        log.info("Stock reduced successfully. New stock: {}, New purchase count: {}, New reviews: {}",
                stock, purchaseCount, reviews);
    }

    // New method to increment purchase count explicitly
    public void incrementPurchaseCount(int quantity) {
        log.debug("Explicitly incrementing purchase count by {}", quantity);
        this.purchaseCount = (this.purchaseCount != null ? this.purchaseCount : 0) + quantity;
        log.info("Purchase count incremented. New purchase count: {}", purchaseCount);
    }
}