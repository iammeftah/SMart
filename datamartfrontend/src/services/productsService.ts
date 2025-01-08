// services/ProductService.ts

import axios from 'axios';
import { Product } from '../Interfaces/Product';

const API_BASE_URL = 'http://localhost:8082/api/products';

export const ProductService = {
    getAllProducts: async (): Promise<Product[]> => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    },

    getProductById: async (id: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            console.log('API Response:', response.data); // Add this debug log
            return response.data;
        } catch (error) {
            console.error('Error details:', error); // Add this debug log
            throw error;
        }
    },


    async getProductByName(name: string): Promise<Product | null> {
        try {
            // Fix: Remove encodeURIComponent from params since axios handles it
            const response = await axios.get(`${API_BASE_URL}/get-by-name`, {
                params: { name }
            });
            return response.data;
        } catch (error: any) {
            // Improve error handling
            if (error.response?.status === 404) {
                console.warn(`Product not found with name: ${name}`);
                return null;
            }
            console.error('Error fetching product by name:', error);
            throw error;
        }
    },


    createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
        // Ensure brandId is a number
        const formattedProduct = {
            ...product,
            brandId: Number(product.brandId),
            price: Number(product.price),
            rating: Number(product.rating),
            reviews: Number(product.reviews),
            purchaseCount: Number(product.purchaseCount),
            discount: Number(product.discount),
            // Ensure arrays are properly formatted
            category: Array.isArray(product.category) ? product.category : [product.category],
            // Ensure booleans are properly formatted
            isNew: Boolean(product.isNew),
            isFeatured: Boolean(product.isFeatured),
            clearance: Boolean(product.clearance),
            // Ensure date is properly formatted
            postedDate: product.postedDate || new Date()
        };

        const response = await axios.post(API_BASE_URL, formattedProduct);
        return response.data;
    },

    updateProduct: async (id: string, product: Product): Promise<Product> => {
        const formattedProduct = {
            ...product,
            brandId: Number(product.brandId),
            price: Number(product.price),
            rating: Number(product.rating),
            reviews: Number(product.reviews),
            purchaseCount: Number(product.purchaseCount),
            discount: Number(product.discount),
            category: Array.isArray(product.category) ? product.category : [product.category],
            isNew: Boolean(product.isNew),
            isFeatured: Boolean(product.isFeatured),
            clearance: Boolean(product.clearance)
        };

        const response = await axios.put(`${API_BASE_URL}/${id}`, formattedProduct);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/${id}`);
    },


    searchProducts: async (
        searchTerm?: string,
        selectedCategory?: string,
        minPrice?: number,
        maxPrice?: number
    ): Promise<Product[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search`, {
                params: {
                    // Only include parameters that are defined
                    ...(searchTerm && { term: searchTerm }),
                    ...(selectedCategory && { category: selectedCategory }),
                    ...(minPrice !== undefined && { minPrice }),
                    ...(maxPrice !== undefined && { maxPrice })
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    },

    async rateProduct(productId: string, rating: number): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/${productId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating }),
        });

        if (!response.ok) {
            throw new Error('Failed to rate product');
        }

        return response.json();
    }




};