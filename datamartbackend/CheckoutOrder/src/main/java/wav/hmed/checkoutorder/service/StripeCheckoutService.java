package wav.hmed.checkoutorder.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wav.hmed.checkoutorder.exceptions.ServiceException;
import wav.hmed.checkoutorder.model.micro.CartItem;
import wav.hmed.checkoutorder.model.order.Order;
import wav.hmed.checkoutorder.model.order.OrderStatus;
import wav.hmed.checkoutorder.model.purchase.CheckoutResponse;
import wav.hmed.checkoutorder.model.transaction.Transaction;
import wav.hmed.checkoutorder.model.transaction.TransactionStatus;
import wav.hmed.checkoutorder.repository.OrderRepository;
import wav.hmed.checkoutorder.repository.TransactionRepository;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeCheckoutService {
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${app.frontend.success-url}")
    private String successUrl;

    @Value("${app.frontend.cancel-url}")
    private String cancelUrl;

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final TransactionRepository transactionRepository;
    private final ProductService productService;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe API initialized successfully");
    }

    public CheckoutResponse createCheckoutSession(List<CartItem> cartItems, String orderId) throws StripeException {

        // Comprehensive product availability validation
        validateProductAvailability(cartItems);

        // Retrieve the existing order instead of creating a new one
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ServiceException("Order not found"));

        // Validate and update the existing order
        validateProductAvailability(cartItems);

        // Update order details if necessary
        order.setItems(cartItems);
        order.setTotalAmount(calculateTotal(cartItems));
        //order.setStatus(OrderStatus.PAYMENT_PENDING); // Moved this line
        order = orderRepository.save(order);

        log.info("Creating checkout session for user: {} with {} items", order.getUserId(), cartItems.size());





        log.info("Checking order: {} and user: {}", order.getId(), order.getUserId());


        try {
            // Create Stripe session
            Session session = buildStripeSession(order, cartItems);

            // Add metadata to the session
            session.setMetadata(Map.of(
                    "orderId", order.getId().toString(),
                    "userId", order.getUserId()  // Ensure we're using the correct user ID here
            ));

            // Update order status to PAYMENT_PENDING
            order.setStatus(OrderStatus.CHECKOUT_INITIATED);
            orderRepository.save(order);

            log.info("Checkout session created successfully for order: {} and user: {}", order.getId(), order.getUserId());
            return new CheckoutResponse(session.getId(), order.getId());

        } catch (StripeException e) {
            log.error("Error creating Stripe checkout session: {}", e.getMessage());

            // Keep the order status as CHECKOUT_INITIATED if session creation fails
            throw e;
        }
    }

    private void validateProductAvailability(List<CartItem> cartItems) {
        for (CartItem item : cartItems) {
            if (!productService.validateProductAvailability(item.getProductId(), item.getQuantity())) {
                log.error("Product {} not available in requested quantity", item.getName());
                throw new RuntimeException("Product " + item.getName() + " is not available in requested quantity");
            }
        }
    }

    private Order createOrder(String userId, List<CartItem> cartItems) {
        Order order = new Order();
        order.setUserId(userId);
        order.setItems(cartItems);
        order.setTotalAmount(calculateTotal(cartItems));
        order.setCreatedAt(new Date());
        order.setStatus(OrderStatus.CHECKOUT_INITIATED);
        return orderRepository.save(order);
    }

    private Session buildStripeSession(Order order, List<CartItem> cartItems) throws StripeException {
        List<SessionCreateParams.LineItem> lineItems = cartItems.stream()
                .map(this::createLineItem)
                .toList();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .addAllLineItem(lineItems)
                .putMetadata("orderId", String.valueOf(order.getId()))
                .putMetadata("userId", order.getUserId())
                .build();

        return Session.create(params);
    }

    private SessionCreateParams.LineItem createLineItem(CartItem item) {
        return SessionCreateParams.LineItem.builder()
                .setQuantity(Long.valueOf(item.getQuantity()))
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount((long) (item.getPrice() * 100)) // Convert to cents
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName(item.getName())
                                                .build()
                                )
                                .build()
                )
                .build();
    }

    private Double calculateTotal(List<CartItem> items) {
        return items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    @Transactional
    public Map<String, Object> confirmPayment(String sessionId) {
        Map<String, Object> response = new HashMap<>();
        log.info("Processing payment confirmation for session: {}", sessionId);

        try {
            Session session = Session.retrieve(sessionId);
            String orderId = session.getMetadata().get("orderId");
            String userId = session.getMetadata().get("userId");

            log.info("Session metadata - Order ID: {}, User ID: {}", orderId, userId);

            if (orderId == null || userId == null) {
                response.put("status", "failed");
                response.put("message", "Invalid session: Order ID or User ID not found");
                return response;
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ServiceException("Order not found"));

            log.info("Order retrieved - Order ID: {}, Order User ID: {}", order.getId(), order.getUserId());

            // Check if payment is already processed
            if (transactionRepository.existsByStripeSessionId(sessionId)) {
                response.put("status", "success");
                response.put("orderId", orderId);
                response.put("totalAmount", order.getTotalAmount());
                response.put("message", "Payment already processed");
                return response;
            }

            // Check payment status
            String paymentStatus = session.getPaymentStatus();
            log.info("Payment status for session {}: {}", sessionId, paymentStatus);

            if ("paid".equals(paymentStatus)) {
                // Verify order ownership
                if (!orderService.verifyOrderOwnership(orderId, userId)) {
                    log.error("Order ownership verification failed for Order ID: {} and User ID: {}", orderId, userId);
                    throw new ServiceException("Order verification failed: Order does not belong to the authenticated user");
                }

                // Update order status to PROCESSING
                order.setStatus(OrderStatus.CHECKOUT_INITIATED);
                orderRepository.save(order);

                // Create transaction record
                Transaction transaction = createTransaction(order, session);

                // Update product stock
                updateProductStock(order);

                log.info("Payment confirmed successfully for order: {}", orderId);

                response.put("status", "success");
                response.put("orderId", orderId);
                response.put("totalAmount", order.getTotalAmount());
                response.put("message", "Payment processed successfully");
            } else {
                log.warn("Payment not confirmed for session: {}. Status: {}", sessionId, paymentStatus);
                response.put("status", "failed");
                response.put("message", "Payment not confirmed by Stripe");
            }

            return response;

        } catch (StripeException e) {
            log.error("Error confirming payment: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }

    public Map<String, String> getTransactionStatus(String sessionId) throws StripeException {
        Map<String, String> response = new HashMap<>();

        try {
            Session session = Session.retrieve(sessionId);
            String orderId = session.getMetadata().get("orderId");

            if (orderId == null) {
                response.put("status", "FAILED");
                return response;
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Check if transaction exists
            Optional<Transaction> transaction = transactionRepository
                    .findByStripeSessionId(sessionId);

            if (transaction.isPresent()) {
                response.put("status", transaction.get().getStatus().toString());
                response.put("orderId", orderId);
            } else if ("paid".equals(session.getPaymentStatus())) {
                response.put("status", "SUCCESS");
                response.put("orderId", orderId);
            } else {
                response.put("status", "PENDING");
                response.put("orderId", orderId);
            }

            return response;

        } catch (StripeException e) {
            log.error("Error checking transaction status: {}", e.getMessage());
            response.put("status", "FAILED");
            return response;
        }
    }

    private Transaction createTransaction(Order order, Session session) {
        Transaction transaction = new Transaction();
        transaction.setOrderId(String.valueOf(order.getId()));
        transaction.setAmount(order.getTotalAmount());
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setCreatedAt(new Date());
        transaction.setStripeSessionId(session.getId());
        return transactionRepository.save(transaction);
    }

    private void updateProductStock(Order order) {
        for (CartItem item : order.getItems()) {
            productService.reduceProductStock(item.getProductId(), item.getQuantity());
        }
    }

    public Map<String, Object> cancelPayment(String sessionId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Session session = Session.retrieve(sessionId);
            String orderId = session.getMetadata().get("orderId");

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            log.info("Payment cancelled for order: {}", orderId);

            response.put("status", "cancelled");
            response.put("orderId", orderId);
            return response;

        } catch (StripeException e) {
            log.error("Error cancelling payment: {}", e.getMessage());
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }

    public Double getOrderAmount(String sessionId) throws StripeException {
        Session session = Session.retrieve(sessionId);
        return session.getAmountTotal() / 100.0; // Convert from cents to dollars
    }
}