package wav.hmed.checkoutorder.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import wav.hmed.checkoutorder.model.micro.Cart;
import wav.hmed.checkoutorder.model.micro.CartItem;

import java.util.List;

@Service
public class CartService {
    private static final Logger log = LogManager.getLogger(CartService.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.products.url}")
    private String productServiceUrl;

    public Cart getUserCart(String userId) {
        try {
            // Get the authorization header from the current request
            HttpHeaders headers = new HttpHeaders();
            String authHeader = getAuthorizationHeader();
            if (authHeader != null) {
                headers.set(AUTHORIZATION_HEADER, authHeader);
                log.debug("Forwarding authorization header to product service for user: {}", userId);
            } else {
                log.warn("No authorization header found in request for user: {}", userId);
            }

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Cart> response = restTemplate.exchange(
                    productServiceUrl + "/cart", // Added /api prefix to match the endpoint
                    HttpMethod.GET,
                    entity,
                    Cart.class
            );

            Cart cart = response.getBody();
            if (cart == null) {
                log.warn("Received null cart for user: {}", userId);
                throw new RuntimeException("Cart not found");
            }

            log.info("Successfully retrieved cart for user: {}", userId);
            return cart;
        } catch (RestClientException e) {
            log.error("Error retrieving cart for user: {}", userId, e);
            throw new RuntimeException("Failed to retrieve cart: " + e.getMessage(), e);
        }
    }



    private String getAuthorizationHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest().getHeader(AUTHORIZATION_HEADER);
        }
        return null;
    }

    public List<CartItem> getCartItems(String userId) {
        Cart cart = getUserCart(userId);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            log.warn("No items found in cart for user: {}", userId);
            throw new RuntimeException("Cart is empty");
        }
        return cart.getItems();
    }


    public void clearCart(String userId) {
        try {
            // Get the authorization header from the current request
            HttpHeaders headers = new HttpHeaders();
            String authHeader = getAuthorizationHeader();
            if (authHeader != null) {
                headers.set(AUTHORIZATION_HEADER, authHeader);
                log.debug("Forwarding authorization header to clear cart for user: {}", userId);
            } else {
                log.warn("No authorization header found in request for user: {}", userId);
                throw new RuntimeException("Authorization header is missing");
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    productServiceUrl + "/cart/clear",
                    HttpMethod.DELETE,  // Change from POST to DELETE
                    entity,
                    Void.class
            );

            log.info("Successfully cleared cart for user: {}", userId);
        } catch (RestClientException e) {
            log.error("Error clearing cart for user: {}", userId, e);
            throw new RuntimeException("Failed to clear cart: " + e.getMessage(), e);
        }
    }
}