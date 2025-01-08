package wav.hmed.checkoutorder.controller;

import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wav.hmed.checkoutorder.exceptions.ServiceException;
import wav.hmed.checkoutorder.model.micro.Cart;
import wav.hmed.checkoutorder.model.micro.User;
import wav.hmed.checkoutorder.model.order.Order;
import wav.hmed.checkoutorder.model.order.OrderStatus;
import wav.hmed.checkoutorder.model.purchase.CheckoutResponse;
import wav.hmed.checkoutorder.model.purchase.PaymentConfirmationResponse;
import wav.hmed.checkoutorder.model.transaction.Transaction;
import wav.hmed.checkoutorder.service.CartService;
import wav.hmed.checkoutorder.service.OrderService;
import wav.hmed.checkoutorder.service.StripeCheckoutService;
import wav.hmed.checkoutorder.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class CheckoutController {
    private final StripeCheckoutService stripeCheckoutService;
    private final UserService userService;
    private final CartService cartService;
    private final OrderService orderService;

    @PostMapping("/create-session")
    public ResponseEntity<CheckoutResponse> createCheckoutSession(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = validateUser(authHeader);  // Validate user based on authorization header
            Cart cart = validateCart(String.valueOf(user.getId()));  // Ensure the cart is valid

            // Log cart details for debugging
            log.info("Creating checkout session for user: {}", user.getId());
            log.info("Cart items: {}", cart.getItems());

            Order order = orderService.initiateCheckout(authHeader);// Initiate order
            log.info("Creating checkout session for order: {}", order.getId());


            CheckoutResponse checkoutResponse = stripeCheckoutService.createCheckoutSession(cart.getItems(), String.valueOf(order.getId()));

            return ResponseEntity.ok(checkoutResponse);  // Return checkout session response
        } catch (Exception e) {
            log.error("Error occurred during checkout session creation", e);
            throw new ServiceException("Unable to create checkout session");
        }
    }


    @PostMapping("/confirm/{sessionId}")
    public ResponseEntity<PaymentConfirmationResponse> confirmPayment(
            @PathVariable String sessionId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) Map<String, String> payload
    ) throws StripeException {
        User user = validateUser(authHeader);
        log.info("Confirming payment for session: {}", sessionId);
        log.info("Authenticated User ID: {}", user.getId());

        // Remove the user ID check from the payload
        Map<String, Object> confirmationResult = stripeCheckoutService.confirmPayment(sessionId);
        PaymentConfirmationResponse response = createPaymentConfirmationResponse(confirmationResult);

        // Verify order ownership
        if (!orderService.verifyOrderOwnership(response.getOrderId(), user.getId())) {
            log.error("Order ownership verification failed for Order ID: {} and User ID: {}", response.getOrderId(), user.getId());
            throw new ServiceException("Order verification failed: Order does not belong to the authenticated user");
        }

        if ("success".equals(response.getStatus())) {
            Transaction transaction = orderService.processPayment(response.getOrderId(), response.getAmount(), authHeader);
            response.setTransactionId(transaction.getId());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Order> getOrder(@PathVariable String orderId, @RequestHeader("Authorization") String authHeader) {
        validateUser(authHeader);
        Order order = orderService.getOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getUserOrders(@RequestHeader("Authorization") String authHeader) {
        User user = validateUser(authHeader);
        List<Order> orders = orderService.getUserOrders(String.valueOf(user.getId()));
        return orders.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(orders);
    }

    @PutMapping("/order/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam OrderStatus status,
            @RequestHeader("Authorization") String authHeader
    ) {
        validateUser(authHeader);
        Order order = orderService.updateOrderStatus(orderId, status, authHeader);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/order/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable String orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        validateUser(authHeader);
        Order order = orderService.cancelOrder(orderId, authHeader);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/order/{orderId}/refund")
    public ResponseEntity<Transaction> refundOrder(
            @PathVariable String orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        validateUser(authHeader);
        Transaction transaction = orderService.refundOrder(orderId, authHeader);
        return ResponseEntity.ok(transaction);
    }

    private User validateUser(String authHeader) {
        User user = userService.getUserFromAuthentication(authHeader);
        if (user == null || user.getId() == null) {
            throw new ServiceException("User authentication failed");
        }
        return user;
    }

    private Cart validateCart(String userId) {
        Cart cart = cartService.getUserCart(userId);
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new ServiceException("Cart is empty");
        }
        return cart;
    }

    private PaymentConfirmationResponse createPaymentConfirmationResponse(Map<String, Object> confirmationResult) {
        return new PaymentConfirmationResponse(
                (String) confirmationResult.get("status"),
                (String) confirmationResult.get("orderId"),
                (Double) confirmationResult.get("totalAmount"),
                (String) confirmationResult.get("message")
        );
    }

    @ExceptionHandler({ServiceException.class, StripeException.class})
    public ResponseEntity<Map<String, String>> handleExceptions(Exception ex) {
        HttpStatus status = (ex instanceof ServiceException) ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity
                .status(status)
                .body(Map.of(
                        "error", ex.getMessage(),
                        "status", status.toString()
                ));
    }
}
