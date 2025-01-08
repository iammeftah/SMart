package wav.hmed.checkoutorder.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wav.hmed.checkoutorder.model.micro.CartItem;
import wav.hmed.checkoutorder.model.order.Order;
import wav.hmed.checkoutorder.repository.PurchaseRelationshipRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseCompletionService {

    private final PurchaseRelationshipService purchaseRelationshipService;
    private final ProductService productService;

    public PurchaseCompletionService(
            PurchaseRelationshipService purchaseRelationshipService,
            ProductService productService
    ) {
        this.purchaseRelationshipService = purchaseRelationshipService;
        this.productService = productService;
    }

    @Transactional
    public void completePurchase(Order order) {
        validateProductAvailability(order.getItems());
        updateProductStocks(order.getItems());
        updatePurchaseRelationships(order.getItems());
    }

    private void validateProductAvailability(List<CartItem> items) {
        for (CartItem item : items) {
            boolean isAvailable = productService.validateProductAvailability(
                    item.getProductId(),
                    item.getQuantity()
            );

            if (!isAvailable) {
                throw new RuntimeException("Product " + item.getProductId() + " is not available in requested quantity");
            }
        }
    }

    private void updateProductStocks(List<CartItem> items) {
        for (CartItem item : items) {
            productService.reduceProductStock(
                    item.getProductId(),
                    item.getQuantity()
            );
        }
    }

    private void updatePurchaseRelationships(List<CartItem> items) {
        List<String> productIds = items.stream()
                .map(CartItem::getProductId)
                .collect(Collectors.toList());

        purchaseRelationshipService.updatePurchaseRelationships(productIds);
    }
}
