import React, { createContext, useContext, useState, useEffect } from "react";
import { cartService } from "../services/CartService";
import { Cart } from "../types/Cart";  // Import from a centralized types file

// Define the context type
interface CartContextType {
    cart: Cart;
    cartItemCount: number;
    fetchCartCount: () => Promise<void>;
    initiateCheckout: () => Promise<void>;
}


// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart>({
        id: '',
        userId: '',
        items: [],
        totalAmount: 0,
        loyaltyPoints: 0,
        lastModified: new Date()
    });
    const [cartItemCount, setCartItemCount] = useState<number>(0);

    const fetchCartCount = async () => {
        try {
            const fetchedCart = await cartService.getCart();
            setCart(fetchedCart);

            const count = fetchedCart.items.reduce((total, item) => total + item.quantity, 0);
            setCartItemCount(count);
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
            setCart({
                id: '',
                userId: '',
                items: [],
                totalAmount: 0,
                loyaltyPoints: 0,
                lastModified: new Date()
            });
            setCartItemCount(0);
        }
    };

    const initiateCheckout = async () => {
        try {
            console.log("Initiating checkout process");
        } catch (error) {
            console.error("Failed to initiate checkout:", error);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, []);

    return (
        <CartContext.Provider value={{
            cart,
            cartItemCount,
            fetchCartCount,
            initiateCheckout
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the CartContext
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};