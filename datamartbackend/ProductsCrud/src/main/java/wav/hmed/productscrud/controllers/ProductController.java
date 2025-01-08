package wav.hmed.productscrud.controllers;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wav.hmed.productscrud.model.Product;
import wav.hmed.productscrud.service.ProductService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable String id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            // Return 404 instead of 500 for "not found" cases
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new HashMap<String, String>() {{
                        put("message", "Product not found with id: " + id);
                    }});
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("message", "Error retrieving product: " + e.getMessage());
                    }});
        }
    }
     // http://localhost:8082/api/products/get-by-name?name=Fitness%2520Tracking%2520Ring

    @GetMapping("/get-by-name")
    public ResponseEntity<Product> getProductByName(@RequestParam String name) {
        try {
            Product product = productService.getProductByName(name);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            // Return 404 instead of 500 for "not found" cases
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable ObjectId id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String term) {
        return ResponseEntity.ok(productService.searchProducts(term));
    }

    @PostMapping("/validate-availability")
    public ResponseEntity<Map<String, Boolean>> validateAvailability(@RequestBody List<Map<String, Object>> items) {
        Map<String, Boolean> availability = new HashMap<>();

        for (Map<String, Object> item : items) {
            String productId = (String) item.get("productId");
            Integer quantity = (Integer) item.get("quantity");

            try {
                Product product = productService.getProductById(productId);
                boolean isAvailable = product != null && product.canReduceStock(quantity);
                availability.put(productId, isAvailable);
            } catch (Exception e) {
                availability.put(productId, false);
            }
        }

        return ResponseEntity.ok(availability);
    }

    @PostMapping("/{productId}/reduce-stock")
    public ResponseEntity<?> reduceStock(@PathVariable String productId, @RequestBody Map<String, Object> request) {
        System.out.println("Reduce stock triggered for product: " + productId);

        try {
            Integer quantity = (Integer) request.get("quantity");

            if (quantity == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Quantity must be provided"));
            }

            Product updatedProduct = productService.reduceProductStock(productId, quantity);
            return ResponseEntity.ok(updatedProduct);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error reducing stock: " + e.getMessage()));
        }
    }

    @PostMapping("/{productId}/rate")
    public ResponseEntity<?> rateProduct(@PathVariable String productId, @RequestBody Map<String, Object> request) {
        try {
            Integer rating = (Integer) request.get("rating");

            if (rating == null || rating < 1 || rating > 10) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid rating. Must be between 1 and 10."));
            }

            Product updatedProduct = productService.updateProductRating(productId, rating);
            return ResponseEntity.ok(updatedProduct);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating product rating: " + e.getMessage()));
        }
    }


    @PostMapping("/{productId}/increment-purchase")
    public ResponseEntity<?> incrementPurchaseCount(@PathVariable String productId, @RequestBody Map<String, Object> request) {
        try {
            Integer quantity = (Integer) request.get("quantity");

            if (quantity == null || quantity <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Quantity must be a positive number"));
            }

            Product updatedProduct = productService.incrementPurchaseCount(productId, quantity);
            return ResponseEntity.ok(updatedProduct);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error incrementing purchase count: " + e.getMessage()));
        }
    }

}





