package wav.hmed.productscrud.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wav.hmed.productscrud.model.Product;
import wav.hmed.productscrud.model.Wishlist;
import wav.hmed.productscrud.repository.WishlistRepository;

@Service
public class WishlistService {
    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductService productService;

    public Wishlist getWishlist(String userId) {
        // Try to find existing wishlist
        Wishlist wishlist = wishlistRepository.findByUserId(userId);

        // If no wishlist exists, create a new one
        if (wishlist == null) {
            wishlist = new Wishlist();
            wishlist.setUserId(userId);
            wishlist = wishlistRepository.save(wishlist);
        }

        return wishlist;
    }

    public void addToWishlist(String userId, ObjectId productId) {
        Wishlist wishlist = getWishlist(userId);

        // Check if product already exists in wishlist
        boolean productExists = wishlist.getProducts().stream()
                .anyMatch(p -> p != null && p.getId() != null &&
                        new ObjectId(p.getId()).equals(productId));

        if (!productExists) {
            Product product = productService.getProductById(productId.toString());
            if (product != null) {
                wishlist.getProducts().add(product);
                wishlistRepository.save(wishlist);
            }
        }
    }

    public void removeFromWishlist(String userId, ObjectId productId) {
        Wishlist wishlist = getWishlist(userId);
        wishlist.getProducts().removeIf(p -> p != null && p.getId() != null &&
                new ObjectId(p.getId()).equals(productId));
        wishlistRepository.save(wishlist);
    }


    public boolean isInWishlist(String userId, ObjectId productId) {
        Wishlist wishlist = getWishlist(userId);
        return wishlist.getProducts().stream()
                .anyMatch(product -> product != null && new ObjectId(product.getId()).equals(productId));
    }

    public void clearWishlist(String userId) {
        Wishlist wishlist = getWishlist(userId);
        wishlist.getProducts().clear();
        wishlistRepository.save(wishlist);
    }
}