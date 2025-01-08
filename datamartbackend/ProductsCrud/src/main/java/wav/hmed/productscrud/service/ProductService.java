package wav.hmed.productscrud.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wav.hmed.productscrud.model.Product;
import wav.hmed.productscrud.repository.ProductRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class ProductService {

    private static final Logger log = LogManager.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductByName(String name) {
        return productRepository.findByName(name).orElseThrow(() -> new RuntimeException("Product not found with name: " + name));
    }


    public Product createProduct(Product product) {
        product.setId((ObjectId)null); // Let MongoDB generate the ID
        product.setPostedDate(Instant.now());
        return productRepository.save(product);
    }

    public Product updateProduct(ObjectId id, Product product) {
        Product existingProduct = getProductById(String.valueOf(id));
        product.setId(id);
        product.setPostedDate(existingProduct.getPostedDate()); // Preserve original posted date
        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public List<Product> searchProducts(String searchTerm) {
        return productRepository.searchProducts(searchTerm);
    }

    @Transactional
    public Product incrementPurchaseCount(String productId, int quantity) {
        log.info("Incrementing purchase count for productId: {} by quantity: {}", productId, quantity);

        Product product = getProductById(productId);
        product.incrementPurchaseCount(quantity);
        Product savedProduct = productRepository.save(product);

        log.info("Purchase count updated. ProductId: {}, New count: {}",
                productId, savedProduct.getPurchaseCount());

        return savedProduct;
    }

    @Transactional
    public Product reduceProductStock(String productId, int quantity) {
        log.info("Reducing stock for productId: {} by quantity: {}", productId, quantity);

        Product product = getProductById(productId);

        // Ensure we're working with the existing product's ID
        ObjectId existingId = product.getId() != null ? new ObjectId(product.getId()) : null;
        if (existingId == null) {
            throw new RuntimeException("Product ID cannot be null");
        }

        product.reduceStock(quantity);

        // Ensure the ID is preserved
        product.setId(existingId);
        Product savedProduct = productRepository.save(product);

        log.info("Product stock updated. ProductId: {}, New stock: {}, Purchase count: {}",
                productId, savedProduct.getStock(), savedProduct.getPurchaseCount());

        return savedProduct;
    }


    public Product getProductById(String id) {
        log.debug("Fetching product with id: {}", id);
        try {
            return productRepository.findById(id)
                    .orElseThrow(() -> {
                        log.error("Product not found with id: {}", id);
                        return new RuntimeException("Product not found with id: " + id);
                    });
        } catch (IllegalArgumentException e) {
            log.error("Invalid ObjectId format: {}", id);
            throw new RuntimeException("Invalid ObjectId format: " + id);
        }
    }


    @Transactional
    public Product updateProductRating(String productId, int newRating) {
        log.info("Updating rating for productId: {} with new rating: {}", productId, newRating);

        Product product = getProductById(productId);

        double currentTotalRating = product.getRating() * product.getReviews();
        int newTotalReviews = product.getReviews() + 1;
        double newAverageRating = (currentTotalRating + newRating) / newTotalReviews;

        newAverageRating = Math.round(newAverageRating * 10.0) / 10.0;

        product.setRating(newAverageRating);
        product.setReviews(newTotalReviews);

        Product updatedProduct = productRepository.save(product);
        log.info("Product rating updated. ProductId: {}, New rating: {}, Total reviews: {}",
                productId, updatedProduct.getRating(), updatedProduct.getReviews());

        return updatedProduct;
    }

    @Scheduled(fixedRate = 24 * 60 * 60 * 1000) // Run daily
    @Transactional
    public void updateNewProductStatus() {
        log.info("Updating product 'isNew' status");

        List<Product> newProducts = productRepository.findByIsNewTrue();

        for (Product product : newProducts) {
            Instant postedDate = product.getPostedDate();
            if (postedDate == null) {
                log.warn("Product {} has null posted date", product.getName());
                continue;
            }

            long daysSincePosted = calculateDaysSincePosted(postedDate);

            if (daysSincePosted > 7) {
                product.setIsNew(false);
                productRepository.save(product);

                log.info("Updated product '{}' isNew status. Days since posted: {}",
                        product.getName(), daysSincePosted);
            }
        }

        log.info("Completed updating product 'isNew' status");
    }

    private long calculateDaysSincePosted(Instant postedDate) {
        return ChronoUnit.DAYS.between(
                postedDate.atZone(ZoneId.systemDefault()).toLocalDate(),
                LocalDate.now()
        );
    }
}