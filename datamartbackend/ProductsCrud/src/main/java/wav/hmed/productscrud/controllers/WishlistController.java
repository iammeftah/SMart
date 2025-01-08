package wav.hmed.productscrud.controllers;


import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wav.hmed.productscrud.model.Wishlist;
import wav.hmed.productscrud.service.UserService;
import wav.hmed.productscrud.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Wishlist> getWishlist(
            @RequestHeader("Authorization") String authHeader
    ) {
        System.out.println("Authorization Header: " + authHeader); // Debug
        String userId = userService.getCurrentUserId(authHeader);
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }


    @PostMapping("/add/{productId}")
    public ResponseEntity<Void> addToWishlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId) {
        String userId = userService.getCurrentUserId(authHeader);
        System.out.println("Added to Wishlist");
        wishlistService.addToWishlist(userId, new ObjectId(productId));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId) {
        String userId = userService.getCurrentUserId(authHeader);
        System.out.println("Removed from Wishlist");
        wishlistService.removeFromWishlist(userId, new ObjectId(productId));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> isInWishlist(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String productId) {
        String userId = userService.getCurrentUserId(authHeader);
        System.out.println("Checking if product is in Wishlist");
        boolean isInWishlist = wishlistService.isInWishlist(userId, new ObjectId(productId));
        return ResponseEntity.ok(isInWishlist);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearWishlist(
            @RequestHeader("Authorization") String authHeader) {
        String userId = userService.getCurrentUserId(authHeader);
        System.out.println("Clearing Wishlist for user: " + userId);
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok().build();
    }
}