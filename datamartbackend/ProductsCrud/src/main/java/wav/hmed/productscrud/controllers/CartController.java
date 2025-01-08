package wav.hmed.productscrud.controllers;

import wav.hmed.productscrud.model.*;
import wav.hmed.productscrud.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wav.hmed.productscrud.service.UserService;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {
    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Cart> getCart(
            @RequestHeader("Authorization") String authHeader
    ) {
        String userId = userService.getCurrentUserId(authHeader);
        log.info("GET /api/cart - Fetching cart for user: {}", userId);
        try {
            Cart cart = cartService.getOrCreateCart(userId);
            log.info("Cart retrieved successfully: {}", cart);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            log.error("Error fetching cart for user {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Cart> addToCart(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId,
            @RequestParam Integer quantity) {
        String userId = userService.getCurrentUserId(authHeader);
        log.info("POST /api/cart/add/{} - Adding product to cart. Quantity: {}", productId, quantity);
        try {
            Cart updatedCart = cartService.addToCart(userId, productId, quantity);
            log.info("Product added to cart successfully. Updated cart: {}", updatedCart);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            log.error("Error adding product {} to cart: {}", productId, e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/update/{productId}")
    public ResponseEntity<Cart> updateCartItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId,
            @RequestParam Integer quantity) {
        String userId = userService.getCurrentUserId(authHeader);
        log.info("PUT /api/cart/update/{} - Updating cart item. New quantity: {}", productId, quantity);
        try {
            Cart updatedCart = cartService.updateCartItemQuantity(userId, productId, quantity);
            log.info("Cart item updated successfully. Updated cart: {}", updatedCart);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            log.error("Error updating cart item {}: {}", productId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Cart> removeFromCart(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId) {
        String userId = userService.getCurrentUserId(authHeader);
        log.info("DELETE /api/cart/remove/{} - Removing item from cart", productId);
        try {
            Cart updatedCart = cartService.removeFromCart(userId, productId);
            log.info("Item removed from cart successfully. Updated cart: {}", updatedCart);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            log.error("Error removing item {} from cart: {}", productId, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            @RequestHeader("Authorization") String authHeader) {
        String userId = userService.getCurrentUserId(authHeader);
        log.info("DELETE /api/cart - Clearing cart for user: {}", userId);
        try {
            cartService.clearCart(userId);
            log.info("Cart cleared successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error clearing cart: {}", e.getMessage(), e);
            throw e;
        }
    }
}