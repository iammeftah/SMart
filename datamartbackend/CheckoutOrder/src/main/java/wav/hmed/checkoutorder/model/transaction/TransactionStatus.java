package wav.hmed.checkoutorder.model.transaction;

public enum TransactionStatus {
    PENDING,       // Initial state
    PROCESSING,    // Payment is being processed
    SUCCESS,       // Payment successful
    FAILED,        // Payment failed
    REFUNDED,      // Transaction has been refunded
    CANCELLED,     // Transaction was cancelled
    DISPUTED       // Transaction is under dispute
}