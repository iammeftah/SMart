package wav.hmed.productscrud.service;

import wav.hmed.productscrud.model.*;
import wav.hmed.productscrud.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.bson.types.ObjectId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    newCart.setItems(new ArrayList<>());
                    newCart.setTotalAmount(0.0);
                    newCart.setLoyaltyPoints(0);
                    newCart.setLastModified(new Date());
                    return cartRepository.save(newCart);
                });
    }

    public Cart addToCart(String userId, String productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        Optional<Product> productOpt = productRepository.findById(String.valueOf(new ObjectId(productId)));

        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            CartItem cartItem = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst()
                    .orElse(null);

            if (cartItem != null) {
                cartItem.setQuantity(cartItem.getQuantity() + quantity);
                cartItem.setSubtotal(calculateItemSubtotal(cartItem));
            } else {
                cartItem = new CartItem();
                cartItem.setProductId(productId);
                cartItem.setName(product.getName());
                cartItem.setPrice(product.getPrice());
                cartItem.setQuantity(quantity);
                cartItem.setImage(product.getImage());
                cartItem.setDiscount(product.getDiscount());
                cartItem.setBrandName(product.getBrandName());
                cartItem.setSubtotal(calculateItemSubtotal(cartItem));
                cart.getItems().add(cartItem);
            }

            updateCartTotals(cart);
            cart.setLastModified(new Date());
            return cartRepository.save(cart);
        }

        throw new RuntimeException("Product not found");
    }



    public Cart updateCartItemQuantity(String userId, String productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItem.setSubtotal(calculateItemSubtotal(cartItem));
        }

        updateCartTotals(cart);
        cart.setLastModified(new Date());
        return cartRepository.save(cart);
    }

    public Cart removeFromCart(String userId, String productId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        updateCartTotals(cart);
        cart.setLastModified(new Date());
        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        cartRepository.deleteByUserId(userId);
    }

    private Double calculateItemSubtotal(CartItem item) {
        double discountMultiplier = (100 - (item.getDiscount() != null ? item.getDiscount() : 0)) / 100.0;
        return item.getPrice() * item.getQuantity() * discountMultiplier;
    }

    private void updateCartTotals(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
        cart.setTotalAmount(total);
    }

    /*
    public List<Product> getRecommendedProducts(String userId) {
        // Temporary implementation - returns featured and new products
        // This will be replaced with ML-based recommendations later
        return productRepository.findByIsFeaturedTrueOrIsNewTrueOrderByRatingDesc()
                .stream()
                .limit(4)
                .collect(Collectors.toList());
    }
    */
}