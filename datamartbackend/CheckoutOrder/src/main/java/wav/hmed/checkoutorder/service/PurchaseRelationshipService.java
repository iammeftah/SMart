package wav.hmed.checkoutorder.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wav.hmed.checkoutorder.model.purchase.PurchaseRelationship;
import wav.hmed.checkoutorder.repository.PurchaseRelationshipRepository;

import java.util.List;
import java.util.Date;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
public class PurchaseRelationshipService {

    private final PurchaseRelationshipRepository repository;
    private final ProductService productService;

    public PurchaseRelationshipService(PurchaseRelationshipRepository repository, ProductService productService) {
        this.repository = repository;
        this.productService = productService;
    }

    @Transactional
    public void updatePurchaseRelationships(List<String> purchasedProductIds) {
        if (purchasedProductIds == null || purchasedProductIds.isEmpty()) {
            return;
        }

        // Get names for all products in the transaction
        List<String> productNames = purchasedProductIds.stream()
                .map(id -> productService.getProductNameById(id))
                .filter(name -> name != null)
                .collect(Collectors.toList());

        // Create a new purchase relationship record for this transaction
        PurchaseRelationship transaction = new PurchaseRelationship();
        transaction.setTransactionId(UUID.randomUUID().toString());
        transaction.setProductNames(productNames);
        transaction.setPurchaseDate(new Date());

        repository.save(transaction);
    }

    // Get transaction details by transaction ID
    public Optional<PurchaseRelationship> getTransactionDetails(String transactionId) {
        return repository.findByTransactionId(transactionId);
    }

    // Get transactions between dates
    public List<PurchaseRelationship> getTransactionsBetweenDates(Date startDate, Date endDate) {
        return repository.findByPurchaseDateBetween(startDate, endDate);
    }
}