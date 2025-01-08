import type { Product } from '../Interfaces/Product'

const API_URL = 'http://localhost:8082/api/wishlist'

export const WishlistService = {
    getAuthHeader(): HeadersInit {
        const token = localStorage.getItem('token')
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    },

    async getWishlistItems(): Promise<Product[]> {
        try {
            const response = await fetch(API_URL, {
                headers: this.getAuthHeader()
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch wishlist: ${await response.text()}`)
            }

            const data = await response.json()
            if (data && data.products) {
                return data.products.map((product: any) => ({
                    ...product,
                    id: product.id || product._id || (product._id && product._id.$oid)
                }))
            }

            return []
        } catch (error) {
            console.error('Error in getWishlistItems:', error)
            throw error
        }
    },

    async addToWishlist(productId: string): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/add/${productId}`, {
                method: 'POST',
                headers: this.getAuthHeader()
            })

            if (!response.ok) {
                throw new Error(`Failed to add item to wishlist: ${await response.text()}`)
            }
        } catch (error) {
            console.error('Error in addToWishlist:', error)
            throw error
        }
    },

    async removeFromWishlist(productId: string): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/remove/${productId}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            })

            if (!response.ok) {
                throw new Error(`Failed to remove item from wishlist: ${await response.text()}`)
            }
        } catch (error) {
            console.error('Error in removeFromWishlist:', error)
            throw error
        }
    },

    async clearAll(): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/clear`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            })

            if (!response.ok) {
                throw new Error(`Failed to clear wishlist: ${await response.text()}`)
            }
        } catch (error) {
            console.error('Error in clearAll:', error)
            throw error
        }
    },

    async isInWishlist(productId: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/check/${productId}`, {
                headers: this.getAuthHeader()
            })

            if (!response.ok) {
                throw new Error(`Failed to check wishlist status: ${await response.text()}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error in isInWishlist:', error)
            throw error
        }
    }
}
