import { Cart } from "../types/Cart";
import { RecommendedProduct } from "../types/RecommendProduct";
import {mockRecommendedProducts} from "../Mock/recommendedProducts";

const API_BASE_URL = 'http://localhost:8082/api';

export const cartService = {
    getCart: async (): Promise<Cart> => {  // Changed to arrow function
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: cartService.getAuthHeader()  // Reference cartService directly
            });



            if (!response.ok) {
                throw new Error(`Failed to fetch cart: ${await response.text()}`);
            }

            const data = await response.json();
            return {
                ...data,
                items: data.items.map((item: any) => ({
                    id: item.productId,
                    ...item
                }))
            };
        } catch (error) {
            console.error('Error in getCart:', error);
            throw error;
        }
    },

    getAuthHeader: (): HeadersInit => {  // Changed to arrow function
        const token = localStorage.getItem('token')
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    },


    getRecommendations: async (): Promise<RecommendedProduct[]> => {
        // Return mock data instead of making an API call
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                resolve(mockRecommendedProducts);
            }, 500);
        });
    },

    /*
    * getRecommendations: async (): Promise<RecommendedProduct[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/recommendations`, {
                headers: cartService.getAuthHeader()
            });

            if (!response.ok) {
                // Log detailed error information
                console.error('Recommendations API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });

                // If it's a 404, log a specific message
                if (response.status === 404) {
                    console.warn('Recommendations endpoint not found. Please verify the API endpoint is implemented on the backend.');
                }

                const errorText = await response.text();
                throw new Error(`Failed to fetch recommendations: ${errorText}`);
            }

            const data = await response.json();

            // Validate that we received an array
            if (!Array.isArray(data)) {
                console.error('Invalid recommendations data format:', data);
                return [];
            }

            return data;
        } catch (error) {
            // Log the full error
            console.error('Error in getRecommendations:', {
                error,
                endpoint: `${API_BASE_URL}/recommendations`,
                headers: cartService.getAuthHeader()
            });

            // Return empty array but log the failure
            console.warn('Falling back to empty recommendations due to error');
            return [];
        }
    },
    * */

    async addToCart(productId: string, quantity: number): Promise<Cart> {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/add/${productId}?quantity=${quantity}`, {
                method: 'POST',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`Failed to add item to cart: ${await response.text()}`);
            }
            const data = await response.json();
            return {
                ...data,
                items: data.items.map((item: any) => ({
                    id: item.productId,
                    ...item
                }))
            };
        } catch (error) {
            console.error('Error in addToCart:', error);
            throw error;
        }
    },

    async updateCartItem(productId: string, quantity: number): Promise<Cart> {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/update/${productId}?quantity=${quantity}`, {
                method: 'PUT',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`Failed to update cart item: ${await response.text()}`);
            }
            const data = await response.json();
            return {
                ...data,
                items: data.items.map((item: any) => ({
                    id: item.productId,
                    ...item
                }))
            };
        } catch (error) {
            console.error('Error in updateCartItem:', error);
            throw error;
        }
    },

    async removeFromCart(productId: string): Promise<Cart> {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`Failed to remove item from cart: ${await response.text()}`);
            }
            const data = await response.json();
            return {
                ...data,
                items: data.items.map((item: any) => ({
                    id: item.productId,
                    ...item
                }))
            };
        } catch (error) {
            console.error('Error in removeFromCart:', error);
            throw error;
        }
    },

    async clearCart(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error(`Failed to clear cart: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error in clearCart:', error);
            throw error;
        }
    }
};

