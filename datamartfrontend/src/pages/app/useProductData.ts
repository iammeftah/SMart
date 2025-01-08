import { useState, useEffect } from 'react'
import { Product } from '../../Interfaces/Product'
import {ProductService} from "../../services/productsService";

export function useProductData() {
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const products = await ProductService.getAllProducts()
                setAllProducts(products)
                setLoading(false)
            } catch (err) {
                setError('Failed to fetch products')
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    return { allProducts, loading, error }
}
