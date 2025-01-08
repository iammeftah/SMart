package wav.hmed.checkoutorder.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import wav.hmed.checkoutorder.model.micro.Product;

import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    private static final Logger log = LogManager.getLogger(ProductService.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";

    private final RestTemplate restTemplate;

    @Value("${services.products.url}")
    private String productServiceUrl;

    public ProductService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Retryable(
            value = { RuntimeException.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000))
    public boolean validateProductAvailability(String productId, int quantity) {
        log.info("Validating availability for productId: {} quantity: {}", productId, quantity);

        try {
            String availabilityUrl = productServiceUrl + "/products/validate-availability";
            log.debug("Making request to: {}", availabilityUrl);

            HttpHeaders headers = createHeaders();
            log.debug("Headers created. Auth header present: {}", headers.containsKey("Authorization"));

            List<Map<String, Object>> requestBody = List.of(
                    Map.of("productId", productId, "quantity", quantity)
            );
            log.debug("Request body created: {}", requestBody);

            HttpEntity<List<Map<String, Object>>> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Sending availability check request...");
            ResponseEntity<Map> response = restTemplate.exchange(
                    availabilityUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            log.debug("Received response. Status: {}", response.getStatusCode());

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Boolean> availability = response.getBody();
                boolean isAvailable = Boolean.TRUE.equals(availability.get(productId));
                log.info("Availability check result for productId: {}: {}", productId, isAvailable);
                return isAvailable;
            }

            log.warn("Unexpected response format or status code: {}", response.getStatusCode());
            return false;

        } catch (Exception e) {
            log.error("Error checking product availability for productId: {}", productId, e);
            throw new RuntimeException("Failed to validate product availability", e);
        }
    }

    @Retryable(
            value = { RuntimeException.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000))
    public void reduceProductStock(String productId, int quantity) {
        log.info("Attempting to reduce stock for productId: {} quantity: {}", productId, quantity);

        try {
            String stockUrl = productServiceUrl + "/products/" + productId + "/reduce-stock";
            log.debug("Making request to: {}", stockUrl);

            HttpHeaders headers = createHeaders();

            Map<String, Object> requestBody = Map.of("quantity", quantity);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    stockUrl,
                    HttpMethod.POST,
                    entity,
                    Void.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to reduce product stock. Status: " + response.getStatusCode());
            }

            log.info("Successfully reduced stock for productId: {}", productId);

        } catch (HttpServerErrorException e) {
            log.error("Server error reducing stock for productId: {}", productId, e);
            throw new RuntimeException("Failed to reduce product stock: " + e.getMessage());
        }
    }

    private HttpHeaders createHeaders() {
        log.debug("Creating HTTP headers");
        HttpHeaders headers = new HttpHeaders();
        String authHeader = getAuthorizationHeader();
        if (authHeader != null) {
            headers.set(AUTHORIZATION_HEADER, authHeader);
            log.debug("Authorization header added");
        } else {
            log.warn("No authorization header found in current request context");
        }
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String getAuthorizationHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String authHeader = attributes.getRequest().getHeader(AUTHORIZATION_HEADER);
            log.debug("Retrieved authorization header: {}",
                    authHeader != null ? "Present (starts with: " + authHeader.substring(0, Math.min(10, authHeader.length())) + "...)" : "null");
            return authHeader;
        }
        log.warn("No request attributes found");
        return null;
    }


    public String getProductNameById(String productId) {
        // Assuming you have an endpoint to fetch the product details by ID
        String url = productServiceUrl + "/products/" + productId;
        try {
            Product product = restTemplate.getForObject(url, Product.class);
            return (product != null) ? product.getName() : null;
        } catch (Exception e) {
            // Handle any error that might occur during the REST call
            System.err.println("Error fetching product name for ID: " + productId);
            return null;
        }
    }
}

