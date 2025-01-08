package wav.hmed.checkoutorder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wav.hmed.checkoutorder.exceptions.ServiceException;
import wav.hmed.checkoutorder.model.micro.Cart;
import wav.hmed.checkoutorder.model.micro.CartItem;
import wav.hmed.checkoutorder.model.micro.User;
import wav.hmed.checkoutorder.model.order.Order;
import wav.hmed.checkoutorder.model.order.OrderStatus;
import wav.hmed.checkoutorder.model.transaction.Transaction;
import wav.hmed.checkoutorder.model.transaction.TransactionStatus;
import wav.hmed.checkoutorder.model.transaction.TransactionType;
import wav.hmed.checkoutorder.repository.OrderRepository;
import wav.hmed.checkoutorder.repository.TransactionRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final PurchaseCompletionService purchaseCompletionService;
    private final UserService userService;
    private final CartService cartService;
    private final ProductService productService;
    private final PurchaseRelationshipService purchaseRelationshipService;

    @Transactional
    public Order initiateCheckout(String authToken) {
        User user = validateUser(authToken);
        if (user == null) {
            throw new ServiceException("User not found or invalid authentication token.");
        }
        log.info("Initiating checkout for user ID: {}", user.getId());

        var cart = cartService.getUserCart(user.getId());
        if (cart == null || cart.getItems().isEmpty()) {
            throw new ServiceException("The cart is empty or not found.");
        }

        validateCart(cart);
        validateProductsAvailability(cart.getItems());

        var order = new Order();
        order.setId(new ObjectId());
        order.setUserId(user.getId());
        log.info("order.user.getId() : {}", user.getId());
        log.info("order.getUserId() : {}", order.getUserId());
        log.info("order.getOrderId() : {}", order.getId());

        order.setItems(cart.getItems());
        order.setTotalAmount(cart.getTotalAmount());
        order.setLoyaltyPoints(cart.getLoyaltyPoints());
        order.setCreatedAt(new Date());
        order.setStatus(OrderStatus.CHECKOUT_INITIATED);

        log.info("Created order with ID: {} for user ID: {}", order.getId(), order.getUserId());
        log.info("initiateCheckout() - order.getStatus() : {}", order.getStatus());

        return orderRepository.save(order);
    }


    private User validateUser(String authToken) {
        var user = userService.getUserFromAuthentication(authToken);
        if (user == null) {
            throw new ServiceException("User authentication failed");
        }
        return user;
    }

    private void validateCart(Cart cart) {
        if (cart == null) {
            throw new ServiceException("Cart not found");
        }
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new ServiceException("Cart is empty");
        }
    }

    private void validateProductsAvailability(List<CartItem> items) {
        for (CartItem item : items) {
            if (item.getProductId() == null || item.getQuantity() == null) {
                throw new ServiceException("Invalid product data in cart");
            }
            boolean isAvailable = productService.validateProductAvailability(
                    item.getProductId(),
                    item.getQuantity()
            );
            if (!isAvailable) {
                throw new ServiceException(
                        String.format("Product %s is not available in requested quantity: %d",
                                item.getName(), item.getQuantity())
                );
            }
        }
    }

    @Transactional
    public Transaction processPayment(String orderId, Double amount, String authToken) {
        System.out.println("Order Service: processPayment() triggered");
        User user = validateUser(authToken);
        log.info("user.getId() : {}", user.getId());
        var order = getAndValidateOrder(orderId, user.getId());
        log.info("order.getId() : {}", order.getId());

        validatePaymentAmount(amount, order.getTotalAmount());
        log.info("order.getStatus() : {}", order.getStatus());
        validateOrderStatus(order.getStatus(), OrderStatus.CHECKOUT_INITIATED);

        var transaction = createTransaction(orderId, amount, TransactionType.PAYMENT);

        try {
            // First save the transaction as processing
            transaction = transactionRepository.save(transaction);

            // Complete the purchase (this includes stock reduction)
            // purchaseCompletionService.completePurchase(order);

            // Update order status
            order.setStatus(OrderStatus.SHIPPED);
            orderRepository.save(order);

            cartService.clearCart(user.getId());

            // Update transaction status
            transaction.setStatus(TransactionStatus.SUCCESS);

            // Inside processPayment() in OrderService, after successful payment:
            List<String> productIds = order.getItems().stream()
                    .map(CartItem::getProductId)
                    .collect(Collectors.toList());
            purchaseRelationshipService.updatePurchaseRelationships(productIds);

            return transactionRepository.save(transaction);

        } catch (Exception e) {
            handlePaymentFailure(order, transaction, e);
            throw new ServiceException("Payment processing failed: " + e.getMessage());
        }
    }

    private Transaction createTransaction(String orderId, Double amount, TransactionType type) {
        var transaction = new Transaction();
        transaction.setId(UUID.randomUUID().toString());
        transaction.setOrderId(orderId);
        transaction.setAmount(amount);
        transaction.setStatus(TransactionStatus.PROCESSING);
        transaction.setCreatedAt(new Date());
        return transactionRepository.save(transaction);
    }

    private void handlePaymentFailure(Order order, Transaction transaction, Exception e) {
        log.error("Payment processing failed for order {}: {}", order.getId(), e.getMessage());
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        transaction.setStatus(TransactionStatus.FAILED);
        transactionRepository.save(transaction);
    }

    @Transactional
    public Order cancelOrder(String orderId, String authToken) {
        User user = validateUser(authToken);
        var order = getAndValidateOrder(orderId, user.getId());

        var cancelableStatuses = List.of(
                OrderStatus.CART,
                OrderStatus.CHECKOUT_INITIATED,
                OrderStatus.RETURNED,
                OrderStatus.CANCELLED
        );

        if (!cancelableStatuses.contains(order.getStatus())) {
            throw new ServiceException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Transactional
    public Transaction refundOrder(String orderId, String authToken) {
        User user = validateUser(authToken);
        var order = getAndValidateOrder(orderId, user.getId());

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ServiceException("Only delivered orders can be refunded");
        }

        var transaction = createTransaction(orderId, order.getTotalAmount(), TransactionType.REFUND);

        try {
            // Process refund logic here
            order.setStatus(OrderStatus.REFUNDED);
            orderRepository.save(order);

            transaction.setStatus(TransactionStatus.SUCCESS);
            return transactionRepository.save(transaction);
        } catch (Exception e) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new ServiceException("Refund processing failed: " + e.getMessage());
        }
    }

    private Order getAndValidateOrder(String orderId, String userId) {
        var order = getOrder(orderId);
        if (!order.getUserId().equals(userId)) {
            throw new ServiceException("Order does not belong to the authenticated user");
        }
        return order;
    }

    private void validatePaymentAmount(Double amount, Double expectedAmount) {
        if (amount == null || amount <= 0) {
            throw new ServiceException("Invalid payment amount");
        }
        if (!amount.equals(expectedAmount)) {
            throw new ServiceException(
                    String.format("Payment amount %.2f does not match order total %.2f",
                            amount, expectedAmount)
            );
        }
    }

    private void validateOrderStatus(OrderStatus currentStatus, OrderStatus expectedStatus) {
        if (currentStatus != expectedStatus) {
            throw new ServiceException(
                    String.format("Invalid order status: expected %s, but was %s",
                            expectedStatus, currentStatus)
            );
        }
    }

    public Order getOrder(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new ServiceException("Order ID cannot be empty");
        }
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ServiceException("Order not found"));
    }

    public List<Order> getUserOrders(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new ServiceException("User ID cannot be empty");
        }
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public Order updateOrderStatus(String orderId, OrderStatus newStatus, String authToken) {
        User user = validateUser(authToken);
        if (user.getRole() != User.Role.ADMIN) {
            throw new ServiceException("Only administrators can update order status");
        }

        var order = getOrder(orderId);
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    String.format("Invalid status transition from %s to %s",
                            currentStatus, newStatus)
            );
        }
    }

    private boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case CART -> next == OrderStatus.CHECKOUT_INITIATED;
            case CHECKOUT_INITIATED -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED || next == OrderStatus.RETURNED;
            case DELIVERED -> next == OrderStatus.RETURNED || next == OrderStatus.REFUNDED;
            case CANCELLED, REFUNDED, RETURNED -> false;
        };
    }


    public boolean verifyOrderOwnership(String orderId, String userId) {
        log.info("Verifying order ownership - Order ID: {}, User ID: {}", orderId, userId);

        return orderRepository.findById(orderId)
                .map(order -> {
                    log.info("Order found - Order User ID: {}, Authenticating User ID: {}", order.getUserId(), userId);
                    boolean isOwner = order.getUserId().equals(userId);
                    log.info("Order ownership verification result: {}", isOwner ? "VERIFIED" : "FAILED");
                    return isOwner;
                })
                .orElseGet(() -> {
                    log.error("Order not found: {}", orderId);
                    return false;
                });
    }
}