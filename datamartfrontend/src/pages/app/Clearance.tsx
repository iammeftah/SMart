'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Product } from '../../Interfaces/Product'
import { useProductData } from './useProductData'
import { ProductCard } from '../../components/ProductCard'
import { ProductCardSkeleton } from '../../components/ProductCardSkeleton'

export default function ClearancePage() {
    const { allProducts, loading, error } = useProductData()
    const [clearanceProducts, setClearanceProducts] = useState<Product[]>([])

    useEffect(() => {
        const filtered = allProducts.filter(product => product.clearance)
        setClearanceProducts(filtered)
    }, [allProducts])

    if (error) return <div>Error: {error}</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-start text-black dark:text-white text-3xl font-bold mb-8">Clearance Products</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductCardSkeleton key={`skeleton-${index}`} />
                        ))
                    ) : clearanceProducts.length === 0 ? (
                        <p className="text-center text-neutral-600 col-span-full">No clearance products available at the moment. Check back soon!</p>
                    ) : (
                        clearanceProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
