package wav.hmed.checkoutorder.model.order;

public enum OrderStatus {
    // Pre-payment statuses
    CART,                   // Items in cart
    CHECKOUT_INITIATED,     // Checkout process started

    // Payment and shipping statuses
    PAID,                   // Payment successful, preparing for shipment
    SHIPPED,                // Order has been shipped
    DELIVERED,              // Order delivered to customer

    // Termination statuses
    CANCELLED,              // Order cancelled by user or system
    REFUNDED,               // Order refunded
    RETURNED                // Order returned by customer
}