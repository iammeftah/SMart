'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Product } from '../../Interfaces/Product'
import { useProductData } from './useProductData'
import { ProductCard } from '../../components/ProductCard'
import { ProductCardSkeleton } from '../../components/ProductCardSkeleton'

export default function TopBrandsPage() {
    const { allProducts, loading, error } = useProductData()
    const [topBrandProducts, setTopBrandProducts] = useState<Product[]>([])

    useEffect(() => {
        // This is a simplified version. In a real application, you might want to fetch top brands from an API
        const topBrandIds = [1, 2, 3, 4, 5] // Assuming these are the IDs of top brands
        const filtered = allProducts.filter(product => topBrandIds.includes(product.brandId))
        setTopBrandProducts(filtered)
    }, [allProducts])

    if (error) return <div>Error: {error}</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-start text-black dark:text-white text-3xl font-bold mb-8 ">Top Brand Products</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductCardSkeleton key={`skeleton-${index}`} />
                        ))
                    ) : topBrandProducts.length === 0 ? (
                        <p className="text-center text-neutral-600 col-span-full">No top brand products available at the moment. Check back soon!</p>
                    ) : (
                        topBrandProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
