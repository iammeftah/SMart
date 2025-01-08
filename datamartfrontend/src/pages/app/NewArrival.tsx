'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useProductData } from './useProductData'
import { Product } from '../../Interfaces/Product'
import { ProductCard } from '../../components/ProductCard'
import { ProductCardSkeleton } from '../../components/ProductCardSkeleton'

export default function NewArrivalsPage() {
    const { allProducts, loading, error } = useProductData()
    const [newArrivals, setNewArrivals] = useState<Product[]>([])

    const filteredProducts = useMemo(() => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return allProducts.filter(product => new Date(product.postedDate) >= thirtyDaysAgo)
    }, [allProducts])

    useEffect(() => {
        setNewArrivals(filteredProducts)
    }, [filteredProducts])

    if (error) return <div>Error: {error}</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-start text-black dark:text-white text-3xl font-bold mb-8 ">New Arrivals</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductCardSkeleton key={`skeleton-${index}`} />
                        ))
                    ) : newArrivals.length === 0 ? (
                        <p className="text-center text-neutral-600 col-span-full">No new arrivals at the moment. Check back soon!</p>
                    ) : (
                        newArrivals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
